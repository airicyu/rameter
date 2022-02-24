/**
 * Factory method to create SampleRecord
 */
export class SampleRecordFactory {
    static from({ label, startTime, success, durationMs, statusCode, statusText, wait, connect, upload, firstByte, download, ...extra }) {
        return {
            label,
            startTime,
            success,
            durationMs,
            statusCode,
            statusText,
            wait,
            connect,
            upload,
            firstByte,
            download,
            ...extra,
        };
    }
}
/**
 * Use for output file CSV
 */
export const defaultSampleHeaders = [
    "label",
    "startTime",
    "success",
    "durationMs",
    "statusCode",
    "statusText",
    "wait",
    "connect",
    "upload",
    "firstByte",
    "download",
    "userGroup",
    "userId",
    "groupUsers",
    "allUsers",
];
//# sourceMappingURL=SampleRecordFactory.js.map