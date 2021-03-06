import { AsyncLocalStorage } from "async_hooks";
import { EventEmitter } from "events";
import * as ioClient from "socket.io-client";
import { sleep } from "../util/sleep.js";
import { registerWorkerNode } from "../util/singleton.js";
import { DefaultSampleForwarder, DEFAULT_CONFIG as DefaultSampleForwarderDefaultConfig } from "../sample/forwarder/DefaultSampleForwarder.js";
import { TestRunner } from "./TestRunner.js";
import { valueGetSet } from "../util/valueGetSet.js";
import { uuidv4 } from "../util/uuid.js";
/**
 * The actual component to run the test. There can be N worker nodes to scale out test client side capacity.
 */
export class WorkerNode {
    constructor(config) {
        this._globalContext = {};
        this._nodeContext = {};
        this._state = "INIT" /* INIT */;
        this._userGroupMap = {};
        this._scenarioMap = {};
        this._eventEmitter = new EventEmitter();
        this._userCount = 0;
        this._userGroupUserCount = {};
        this._config = config;
        this._id = config.workerNode?.id ?? `workerNode-${uuidv4()}`;
        this._ioChannel = new WorkerNodeIOChannel(config, this);
        registerWorkerNode(this);
    }
    setSampleForwarder(sampleForwarder) {
        this._sampleForwarder = sampleForwarder;
    }
    async up() {
        if (!this._sampleForwarder) {
            this._sampleForwarder = new DefaultSampleForwarder(this._config.sampleForwarder ?? DEFAULT_CONFIG.sampleForwarder, this);
        }
        await this._ioChannel.up();
        this._eventEmitter.emit("worker-node:up");
    }
    async readyTest() {
        if (this._loadNodeContextHandler) {
            this._nodeContext = await this._loadNodeContextHandler(this._globalContext);
        }
        this._eventEmitter.emit("worker-node:ready-test");
    }
    setGlobalContext(globalContext) {
        this._globalContext = globalContext;
    }
    loadGlobalContext() {
        throw new Error("Method not implemented.");
    }
    async loadNodeContext(loadNodeContextHandler) {
        this._loadNodeContextHandler = loadNodeContextHandler;
    }
    defineUserScenario(name, scenario) {
        this._scenarioMap[name] = scenario;
    }
    defineUserGroup(name, initUserContext) {
        this._userGroupMap[name] = { initUserContext: initUserContext ?? null };
    }
    async runTest(options) {
        // only can transit from init to run
        if (this.state !== "INIT" /* INIT */) {
            return;
        }
        console.log("runTest", JSON.stringify(options));
        this._state = "RUNNING" /* RUNNING */;
        this._eventEmitter.emit("worker-node:test-started");
        await TestRunner.runTest({
            globalContext: this._globalContext,
            nodeContext: this._nodeContext,
            userCountGetSet: valueGetSet(this, "_userCount"),
            userGroupUserCountGetSet: valueGetSet(this, "_userGroupUserCount"),
            userGroupMap: this._userGroupMap,
            scenarioMap: this._scenarioMap,
            options,
            workerNodeEvent: this._eventEmitter,
        });
        if (this._state === "RUNNING" /* RUNNING */) {
            this._state = "FINISHED" /* FINISHED */;
        }
        await this._sampleForwarder?.flush();
        this._eventEmitter.emit("worker-node:before-test-finished");
        this._eventEmitter.emit("worker-node:test-finished");
    }
    async stopTest() {
        if (this.state !== "RUNNING" /* RUNNING */) {
            return;
        }
        this._state = "FINISHED" /* FINISHED */;
        this._eventEmitter.emit("worker-node:stop-test");
        this._eventEmitter.emit("worker-node:before-test-finished");
        this._eventEmitter.emit("worker-node:test-finished");
    }
    async down() {
        if (this.state !== "RUNNING" /* RUNNING */ && this.state !== "FINISHED" /* FINISHED */) {
            return;
        }
        this._state = "DOWN" /* DOWN */;
        this._eventEmitter.emit("worker-node:down");
    }
    async forwardSampleRecords(sampleRecords) {
        this._sampleForwarder?.forward(sampleRecords);
    }
    get event() {
        return this._eventEmitter;
    }
    get state() {
        return this._state;
    }
    getIOChannelSocket() {
        return this._ioChannel.socket;
    }
}
export class WorkerNodeIOChannel {
    constructor(config, workerNode) {
        this._config = config;
        this._workerNode = workerNode;
    }
    async up() {
        return await new Promise((resolve) => {
            if (!this._socket) {
                this._socket = ioClient.io(`ws://${this._config.master?.host ?? DEFAULT_CONFIG.master.host}:${this._config.master?.port ?? DEFAULT_CONFIG.master.port}/workerNode`);
                /**
                 * Master message driven
                 */
                // after connect, register to Master
                this._socket.on("connect", () => {
                    console.log("connected");
                    this._socket?.emit("worker-node:register-worker-node", this._workerNode._id);
                });
                // after registered, return
                this._socket.on("master:register-worker-node:ack", () => {
                    console.log("receive master:register-worker-node:ack");
                    resolve(true); // after registration done then return out
                });
                // Master tell us globalContext updated
                this._socket.on("master:global-context.update", (globalContext) => {
                    console.log("receive master:global-context.update");
                    this._workerNode.setGlobalContext(globalContext);
                });
                // Master responsed to give us globalContext
                this._socket.on("master:global-context:response", (globalContext) => {
                    console.log("receive master:global-context:response");
                    this._workerNode.setGlobalContext(globalContext);
                });
                // Receive Master's run test broadcast message
                this._socket.on("master:command:run-test", async (options) => {
                    console.log("receive master:command:run-test");
                    this._workerNode.runTest(options);
                });
                // Receive Master's stop test broadcast message
                this._socket.on("master:command:stop-test", async () => {
                    console.log("receive master:command:stop-test");
                    this._workerNode.stopTest();
                });
                // Receive Master's shutdown broadcast message
                this._socket.on("master:command:down", () => {
                    console.log("receive master:command:down");
                    this._workerNode.down();
                });
                /**
                 * Worker Node event driven
                 */
                // ready for running test => tell Master me is ready
                this._workerNode.event.on("worker-node:ready-test", () => {
                    this._socket?.emit("worker-node:ready-test");
                });
                // start running test => tell Master just started
                this._workerNode.event.on("worker-node:test-started", () => {
                    console.log("send worker-node:test-started");
                    this._socket?.emit("worker-node:test-started");
                });
                // Worker Node finished running test => tell Master
                this._workerNode.event.on("worker-node:test-finished", () => {
                    console.log("send worker-node:test-finished");
                    this._socket?.emit("worker-node:test-finished");
                });
                this._workerNode.event.on("worker-node:down", () => {
                    console.log("send worker-node:down");
                    this._socket?.disconnect();
                });
                this._workerNode.event.on("worker-node:spawn-user", ({ user, group }) => {
                    this._socket?.emit("worker-node:spawn-user", { user, group });
                });
                this._workerNode.event.on("worker-node:finish-user", ({ user, group }) => {
                    this._socket?.emit("worker-node:finish-user", { user, group });
                });
                // finally connect it to make interaction happens
                this._socket.connect();
            }
        });
    }
    async down() {
        this._socket?.disconnect();
        await sleep(100);
        process.exit(0);
    }
    get socket() {
        return this._socket;
    }
}
export const testMetaAsyncStorage = new AsyncLocalStorage();
const DEFAULT_CONFIG = {
    master: {
        host: "localhost",
        port: "3001",
    },
    sampleForwarder: DefaultSampleForwarderDefaultConfig,
};
//# sourceMappingURL=WorkerNode.js.map