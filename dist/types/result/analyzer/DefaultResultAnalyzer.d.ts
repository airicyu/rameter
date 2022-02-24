/// <reference types="node" />
import { EventEmitter } from "events";
import type { SummaryRecord, SampleRecord, Summary } from "../../sharedTypes.js";
import type { ResultAnalyzer, Config as BaseConfig } from "./ResultAnalyzer.js";
/**
 * Default implementation for Result analyzer
 */
export declare class DefaultResultAnalyzer implements ResultAnalyzer {
    _config: Config;
    _startTime?: number;
    _summary: {
        [key: string]: SummaryRecord;
    };
    _lastTickTime: number;
    _tickSummary: {
        [key: string]: SummaryRecord;
    };
    distributeRecords: DistributeRecords;
    constructor(config: Config, _masterEvent: EventEmitter);
    init(): Promise<void>;
    processRecordsToSummary(sampleRecords: SampleRecord[]): Promise<void>;
    processRecordsToTickSummary(sampleRecords: SampleRecord[]): Promise<void>;
    tickAndAnalyzeFromLastTick(): Promise<{
        tickSummary: Summary;
        lastTickTime: number;
        thisTickTime: number;
    }>;
    analyzeIntermediateResult(): Promise<{
        startTime: number;
        summary: Summary;
    }>;
    analyze(): Promise<Summary>;
    calDistBlanketsPercentile(blankets: {
        min: number;
        max: number;
        count: number;
    }[], totalRecords: number, percentile: number): number;
    getDistBlanket(durationMs: number): {
        min: number;
        max: number;
    };
}
declare type DistributeRecords = {
    [key: string]: {
        [key: string]: {
            min: number;
            max: number;
            count: number;
        };
    };
};
export declare type Config = {} & BaseConfig;
export {};
