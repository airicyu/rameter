/// <reference types="node" />
import { EventEmitter } from "events";
import { MasterIO } from "./MasterIO.js";
import { ResultManager } from "../result/ResultManager.js";
import type { RunTestOptions, SampleRecord } from "../sharedTypes.js";
/**
 * Master Controller.
 *
 * Serve as controller. It fire commands to worker nodes to run the test. It collect result statistics.
 */
export declare class Master {
    _config: Config;
    _globalContext: any;
    _eventEmitter: EventEmitter;
    _masterIO?: MasterIO;
    _resultManager?: ResultManager;
    _testStartTime?: number;
    _userCount: number;
    _userGroupUserCount: {
        [key: string]: number;
    };
    _nodesReady: boolean;
    constructor(config: Config);
    setMasterIO(masterIO: MasterIO): void;
    up(): Promise<void>;
    waitNodesUp(n?: number): Promise<void>;
    waitNodesReady(n?: number): Promise<void>;
    getGlobalContext(): any;
    exportGlobalContext(globalContext: any): Promise<void>;
    broadcastRunTest(options: RunTestOptions[]): Promise<void>;
    broadcastStopTest(): Promise<void>;
    storeSampleRecords(sampleRecords: SampleRecord[]): Promise<void>;
    tickAndAnalyzeFromLastTick(): Promise<{
        tickSummary: import("../sharedTypes.js").Summary;
        lastTickTime: number;
        thisTickTime: number;
    } | undefined>;
    analyzeIntermediateResult(): Promise<{
        startTime: number;
        summary: import("../sharedTypes.js").Summary;
    } | undefined>;
    analyzeResult(): Promise<import("../sharedTypes.js").Summary | undefined>;
    updateUserCount(userCount: number): void;
    updateUserGroupUserCount(userGroupUserCount: {
        [key: string]: number;
    }): void;
    _afterTestFinished(): Promise<void>;
    down(): Promise<void>;
    downNodes(): Promise<void>;
    get event(): EventEmitter;
    _attachIOChannel(): Promise<void>;
    _waitUntilFinished(): Promise<unknown>;
    waitUntilFinished({ log, openDashboard }?: {
        log?: boolean;
        openDashboard?: boolean;
    }): Promise<void>;
}
export declare type Config = {
    master?: {
        host?: string;
        port?: number;
        masterIO?: MasterIO;
    };
    numWorkerNodes?: number;
    dashboard?: {
        origin?: string;
        port?: number;
    };
    fileResultStore?: {
        batchRecordThershold?: 50;
        batchTimeThershold?: 1000;
        outFile?: string;
    };
    [key: string]: any;
};
