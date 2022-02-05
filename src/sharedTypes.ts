export type RunTestOptions = {
  userModel: any;
  userGroups: string[];
  scenarios: Array<string | string[]>;
};

export type TestMeta = {
  userGroup: string;
  scenario: string | string[];
  userId?: string;
  groupUsers?: number;
  allUsers?: number;
};

export type InitUserContextFunction = (parameters: { globalContext: any; nodeContext: any; userId: string }) => Promise<any>;

export type SampleRecord = {
  label: string;
  startTime: number;
  success: boolean;
  durationMs: number | null;
  statusCode: string | null;
  statusText: string | null;
  testMeta: TestMeta;
  [key: string]: any;
};

export type HttpSampleRecord = SampleRecord & {
  wait: number | null;
  connect: number | null;
  upload: number | null;
  firstByte: number | null;
  download: number | null;
};

export type SummaryRecord = {
  label: string;
  startTime: number;
  count: number;
  success: number;
  fail: number;
  min: number;
  max: number;
  average: number;
  percentile?: {
    p25?: number;
    p50?: number;
    p75?: number;
    p90?: number;
    p95?: number;
  };
};

export type Summary = {
  [key: string]: SummaryRecord;
};
