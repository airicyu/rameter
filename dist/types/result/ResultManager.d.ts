/// <reference types="node" />
import type { ResultStore } from "./store/ResultStore.js";
import type { ResultAnalyzer } from "./analyzer/ResultAnalyzer.js";
import EventEmitter from "events";
import type { SampleRecord, Summary } from "../sharedTypes.js";
/**
 * Manage to store result, and perform result analysis.
 */
export declare class ResultManager {
    _config: Config;
    _resultStore?: ResultStore;
    _resultAnalyzer?: ResultAnalyzer;
    _masterEvent: EventEmitter;
    constructor(config: Config, masterEvent: EventEmitter);
    init(): Promise<void>;
    setResultStore(resultStore: ResultStore): void;
    setResultAnalyzer(resultAnalyzer: ResultAnalyzer): void;
    store(records: SampleRecord[]): Promise<boolean>;
    flushStore(): Promise<boolean>;
    analyzeIntermediateResult(): Promise<{
        startTime: number;
        summary: Summary;
    }>;
    analyze(): Promise<Summary>;
    tickAndAnalyzeFromLastTick(): Promise<{
        tickSummary: Summary;
        lastTickTime: number;
        thisTickTime: number;
    }>;
}
export declare type Config = {
    fileResultStore?: {
        batchRecordThershold?: number;
        batchTimeThershold?: number;
        outFile?: string;
    };
};
