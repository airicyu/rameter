import http from "http";
import * as io from "socket.io";
import { sleep } from "../util/sleep.js";
/**
 * Responsible to handle external IO for Master
 */
export class MasterIO {
    // _master?: Master;
    constructor(config) {
        this._config = config;
    }
    attach(master) {
        // this._master = master;
        this._master = master;
    }
    async up() {
        this._httpServer = http.createServer();
        this._io = new io.Server(this._httpServer, {
            cors: { origin: this._config.dashboard?.origin ?? DEFAULT_CONFIG.dashboard.origin },
        });
        this._io.of("/dashboard").on("connection", (socket) => {
            this._master?.event.on("master:summary:intermediate", (intermediateSummary) => {
                socket.emit("master:summary:intermediate", intermediateSummary);
            });
            this._master?.event.on("master:summary:tick", (tickSummary) => {
                socket.emit("master:summary:tick", tickSummary);
            });
            this._master?.event.on("master:userGroupUserCount", (userGroupUserCount) => {
                socket.emit("master:userGroupUserCount", userGroupUserCount);
            });
            this._master?.event.on("master:test-finished", () => {
                socket.emit("master:test-finished");
            });
            socket.on("dashboard:command:run-test", (options) => {
                this._master?.broadcastRunTest(options);
            });
            socket.on("dashboard:command:stop-test", () => {
                this._master?.broadcastStopTest();
            });
            socket.on("dashboard:command:down", () => {
                this._master?.down();
            });
            socket.on("dashboard:command:down-nodes", () => {
                this._master?.downNodes();
            });
        });
        // connect IO
        this._io.of("/workerNode").on("connection", (socket) => {
            // client side driven events
            console.log("a client connected");
            socket.runTestState = "INIT" /* INIT */;
            // register worker node
            socket.once("worker-node:register-worker-node", (workerNodeId) => {
                socket.workerNodeId = workerNodeId;
                console.log(`worker node ${socket.workerNodeId} connected`);
                socket.emit("master:register-worker-node:ack");
            });
            // worker node disconnect
            socket.on("disconnect", () => {
                console.log(`work node ${socket.workerNodeId} disconnected`);
            });
            // global context request
            socket.on("worker-node:global-context:request", () => {
                // response with global context
                socket.emit("master:global-context:response", this._master?.getGlobalContext());
            });
            // receive sample records
            socket.on("worker-node:sample-records.push", (sampleRecords) => {
                // forward
                this._master?.storeSampleRecords(sampleRecords);
            });
            // ack test start
            socket.on("worker-node:ready-test", () => {
                socket.runTestState = "READY" /* READY */;
            });
            // ack test start
            socket.on("worker-node:test-started", () => {
                socket.runTestState = "RUNNING" /* RUNNING */;
            });
            // node run test finished
            socket.on("worker-node:test-finished", () => {
                socket.runTestState = "FINISHED" /* FINISHED */;
                if (this._io?.of("/workerNode")?.sockets) {
                    let allFinished = true;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
                        if (socket.runTestState === "RUNNING" /* RUNNING */) {
                            allFinished = false;
                            break;
                        }
                    }
                    if (allFinished) {
                        this._master?._afterTestFinished();
                    }
                }
            });
            socket.on("worker-node:spawn-user", ({ user, group }) => {
                socket.userCount = user;
                socket.userGroupUserCount = group;
                if (this._io?.of("/workerNode")?.sockets) {
                    let userCount = 0;
                    const userGroupUserCount = {};
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
                        userCount += socket.userCount ?? 0;
                        if (socket.userGroupUserCount) {
                            for (const [group, count] of Object.entries(socket.userGroupUserCount)) {
                                userGroupUserCount[group] = userGroupUserCount[group] ?? 0;
                                userGroupUserCount[group] += count;
                            }
                        }
                    }
                    this._master?.updateUserCount(userCount);
                    this._master?.updateUserGroupUserCount(userGroupUserCount);
                }
            });
            socket.on("worker-node:finish-user", ({ user, group }) => {
                socket.userCount = user;
                socket.userGroupUserCount = group;
                if (this._io?.of("/workerNode")?.sockets) {
                    let userCount = 0;
                    const userGroupUserCount = {};
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
                        userCount += socket.userCount ?? 0;
                        if (socket.userGroupUserCount) {
                            for (const [group, count] of Object.entries(socket.userGroupUserCount)) {
                                userGroupUserCount[group] = userGroupUserCount[group] ?? 0;
                                userGroupUserCount[group] += count;
                            }
                        }
                    }
                    this._master?.updateUserCount(userCount);
                    this._master?.updateUserGroupUserCount(userGroupUserCount);
                }
            });
        });
        // wait for all nodes init and ready for receive commands
        this._master?.event.on("master:wait-nodes-init", async (n, done) => {
            for (;;) {
                if (this._io?.of("/workerNode")?.sockets) {
                    let nodeCount = 0;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
                        if (socket?.runTestState === "INIT" /* INIT */) {
                            nodeCount++;
                        }
                    }
                    if (nodeCount === n) {
                        break;
                    }
                }
                await sleep(10);
            }
            done();
        });
        // wait for all nodes init and ready for start testing
        this._master?.event.on("master:wait-nodes-ready", async (n, done) => {
            for (;;) {
                if (this._io?.of("/workerNode")?.sockets) {
                    let nodeCount = 0;
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
                        if (socket?.runTestState === "READY" /* READY */) {
                            nodeCount++;
                        }
                    }
                    if (nodeCount === n) {
                        break;
                    }
                }
                await sleep(10);
            }
            done();
        });
        // Master updated globalContext
        this._master?.event.on("master:global-context.update", (globalContext) => {
            // broadcase snapshot
            this._io?.of("/workerNode")?.emit("master:global-context.update", globalContext);
        });
        // master trigger broadcast run test
        this._master?.event.on("master:command:run-test", (options) => {
            this._io?.of("/workerNode")?.emit("master:command:run-test", options);
        });
        // master trigger broadcast stop test
        this._master?.event.on("master:command:stop-test", () => {
            this._io?.of("/workerNode")?.emit("master:command:stop-test");
        });
        // master trigger shutdown nodes
        this._master?.event.on("master:command:down-nodes", async () => {
            this._io?.of("/workerNode")?.emit("master:command:down-nodes");
        });
        // master trigger shutdown
        this._master?.event.on("master:command:down", async () => {
            this._io?.of("/workerNode")?.emit("master:command:down");
            this.down();
        });
        return new Promise((resolve) => {
            this._httpServer?.listen(this._config.master?.port ?? DEFAULT_CONFIG.master.port, () => {
                resolve(true);
            });
        });
    }
    async down() {
        this._io?.close((err) => {
            err && console.error("master server close error", err);
            console.log("master server closed");
        });
    }
}
const DEFAULT_CONFIG = {
    master: {
        host: "localhost",
        port: "3001",
    },
    dashboard: {
        origin: "http://localhost:3000",
        port: 3000,
    },
};
//# sourceMappingURL=MasterIO.js.map