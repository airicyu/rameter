/// <reference types="node" />
import { WorkerNode } from "../../workerNode/WorkerNode.js";
import type { SampleForwarder, Config as BaseConfig } from "./SampleForwarder.js";
import * as ioClient from "socket.io-client";
import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
import type { SampleRecord } from "../../sharedTypes.js";
/**
 * Default implementation of SampleForwarder.
 *
 * It would send back sample result to Master via websocket.
 * It has some kind of internal buffering to flush send when "every N samples buffered or T seconds passed".
 */
export declare class DefaultSampleForwarder implements SampleForwarder {
    _config: Config;
    _socket?: ioClient.Socket;
    _event: EventEmitter;
    _bufferRecords: SampleRecord[];
    _lastForwardTime: number;
    _state: State;
    _deferTrigger?: DeferTrigger;
    constructor(config: Config, workerNode: WorkerNode);
    forward(records: SampleRecord[], forceFlush?: boolean): Promise<any>;
    /**
     * trigger flush of buffer,
     * if it is busying, then would wait to flush.
     */
    flush(): Promise<boolean>;
    /**
     * underlining function to physically forward buffered records
     */
    forwardBufferToMaster(): Promise<void>;
    get batchRecordThershold(): number;
    get batchTimeThershold(): number;
    down(): void;
}
export declare type Config = {
    batchRecordThershold?: number;
    batchTimeThershold?: number;
} & BaseConfig;
export declare const DEFAULT_CONFIG: {
    batchRecordThershold: number;
    batchTimeThershold: number;
};
declare const enum State {
    IDLE = "IDLE",
    FORWARDING = "FORWARDING"
}
export {};
