export interface ResultStore {
  init(): Promise<void>;
  store(records: SampleRecord[], forceFlush?: boolean): Promise<boolean>;
  flushStore(): Promise<boolean>;
}

export type Config = {};
