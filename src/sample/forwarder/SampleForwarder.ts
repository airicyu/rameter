export interface SampleForwarder {
  forward(records: SampleRecord[]): Promise<any>;
  flush(): Promise<any>;
}

export type Config = {};
