export class SampleRecordFactory {
  static from({
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
    ...extra
  }: SampleRecord): SampleRecord {
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
