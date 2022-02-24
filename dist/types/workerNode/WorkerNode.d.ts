/// <reference types="node" />
import { AsyncLocalStorage } from "async_hooks";
import { EventEmitter } from "events";
import * as ioClient from "socket.io-client";
import type { SampleForwarder } from "../sample/forwarder/SampleForwarder.js";
import { Scenario } from "../scenario/Scenario.js";
import type { InitUserContextFunction, RunTestOptions, SampleRecord, TestMeta } from "../sharedTypes.js";
/**
 * The actual component to run the test. There can be N worker nodes to scale out test client side capacity.
 */
export declare class WorkerNode {
    _config: Config;
    _id: string;
    _globalContext: any;
    _nodeContext: any;
    _state: WorkerNodeState;
    _userGroupMap: {
        [key: string]: {
            initUserContext: InitUserContextFunction | null;
        };
    };
    _scenarioMap: {
        [key: string]: Scenario;
    };
    _sampleForwarder?: SampleForwarder;
    _eventEmitter: EventEmitter;
    _ioChannel: WorkerNodeIOChannel;
    _loadNodeContextHandler?: (globalContext: any) => Promise<any>;
    _userCount: number;
    _userGroupUserCount: {
        [key: string]: number;
    };
    constructor(config: Config);
    setSampleForwarder(sampleForwarder: SampleForwarder): void;
    up(): Promise<void>;
    readyTest(): Promise<void>;
    setGlobalContext(globalContext: any): void;
    loadGlobalContext(): void;
    loadNodeContext(loadNodeContextHandler: (globalContext: any) => Promise<any>): Promise<void>;
    defineUserScenario(name: string, scenario: Scenario): void;
    defineUserGroup(name: string, initUserContext?: InitUserContextFunction): void;
    runTest(options: RunTestOptions[]): Promise<void>;
    stopTest(): Promise<void>;
    down(): Promise<void>;
    forwardSampleRecords(sampleRecords: SampleRecord[]): Promise<void>;
    get event(): EventEmitter;
    get state(): WorkerNodeState;
    getIOChannelSocket(): ioClient.Socket | undefined;
}
export declare const enum WorkerNodeState {
    INIT = "INIT",
    RUNNING = "RUNNING",
    FINISHED = "FINISHED",
    DOWN = "DOWN"
}
export declare class WorkerNodeIOChannel {
    _config: Config;
    _workerNode: WorkerNode;
    _socket?: ioClient.Socket;
    constructor(config: Config, workerNode: WorkerNode);
    up(): Promise<unknown>;
    down(): Promise<void>;
    get socket(): ioClient.Socket | undefined;
}
export declare const testMetaAsyncStorage: AsyncLocalStorage<TestMeta>;
export declare type Config = {
    master?: {
        host?: string;
        port?: number;
    };
    workerNode?: {
        id?: string;
    };
    sampleForwarder?: {
        batchRecordThershold?: number;
        batchTimeThershold?: number;
    };
};
