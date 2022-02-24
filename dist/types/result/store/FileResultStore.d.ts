/// <reference types="node" />
import type { ResultStore, Config as BaseConfig } from "./ResultStore.js";
import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
import type { SampleRecord } from "../../sharedTypes.js";
/**
 * Default implementation of ResultStore.
 *
 * Storing result in result file.
 * It has some kind of internal buffering to flush write when "every N samples buffered or T seconds passed".
 */
export declare class FileResultStore implements ResultStore {
    _config: Config;
    _bufferRecords: SampleRecord[];
    _lastWriteTime: number;
    _state: State;
    _csvColumns: {
        key: string;
    }[];
    _deferTrigger: DeferTrigger;
    _event: EventEmitter;
    constructor(config?: Config);
    init(): Promise<void>;
    store(records: SampleRecord[], forceFlush?: boolean): Promise<boolean>;
    flushStore(): Promise<boolean>;
    get batchRecordThershold(): number;
    get batchTimeThershold(): number;
    get outFile(): string;
    flushBufferToFile(): Promise<boolean>;
}
declare const enum State {
    IDLE = "IDLE",
    WRITING = "WRITING"
}
export declare type Config = {
    batchRecordThershold?: number;
    batchTimeThershold?: number;
    outFile?: string;
    extraFields?: string[];
} & BaseConfig;
export {};
