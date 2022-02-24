import type { SampleRecord } from "../sharedTypes";
/**
 * Factory method to create SampleRecord
 */
export declare class SampleRecordFactory {
    static from({ label, startTime, success, durationMs, statusCode, statusText, wait, connect, upload, firstByte, download, ...extra }: SampleRecord): SampleRecord;
}
/**
 * Use for output file CSV
 */
export declare const defaultSampleHeaders: string[];
