import type { ResultStore } from "./store/ResultStore.js";
import { FileResultStore } from "./store/FileResultStore.js";
import type { ResultAnalyzer } from "./analyzer/ResultAnalyzer.js";
import { DefaultResultAnalyzer } from "./analyzer/DefaultResultAnalyzer.js";
import EventEmitter from "events";
import type { SampleRecord, Summary } from "../sharedTypes.js";

/**
 * Manage to store result, and perform result analysis.
 */
export class ResultManager {
  _config: Config;
  _resultStore?: ResultStore;
  _resultAnalyzer?: ResultAnalyzer;

  _masterEvent: EventEmitter;

  constructor(config: Config, masterEvent: EventEmitter) {
    this._config = config;
    this._masterEvent = masterEvent;
    this._resultStore = new FileResultStore(config.fileResultStore);
    this._resultAnalyzer = new DefaultResultAnalyzer({}, masterEvent);
  }

  async init() {
    await this._resultStore?.init();
    await this._resultAnalyzer?.init();
  }

  setResultStore(resultStore: ResultStore) {
    this._resultStore = resultStore;
  }

  setResultAnalyzer(resultAnalyzer: ResultAnalyzer) {
    this._resultAnalyzer = resultAnalyzer;
  }

  async store(records: SampleRecord[]): Promise<boolean> {
    return this._resultStore?.store(records, false) ?? false;
  }

  async flushStore(): Promise<boolean> {
    return this._resultStore?.flushStore() ?? false;
  }

  async analyzeIntermediateResult(): Promise<{ startTime: number; summary: Summary }> {
    if (!this._resultAnalyzer) {
      throw new Error("No result analyzer!");
    }
    return this._resultAnalyzer.analyzeIntermediateResult();
  }

  async analyze(): Promise<Summary> {
    if (!this._resultAnalyzer) {
      throw new Error("No result analyzer!");
    }
    return this._resultAnalyzer.analyze();
  }

  async tickAndAnalyzeFromLastTick(): Promise<{
    tickSummary: Summary;
    lastTickTime: number;
    thisTickTime: number;
  }> {
    if (!this._resultAnalyzer) {
      throw new Error("No result analyzer!");
    }
    return this._resultAnalyzer.tickAndAnalyzeFromLastTick();
  }
}

export type Config = {
  fileResultStore?: {
    batchRecordThershold?: 50;
    batchTimeThershold?: 1000;
    outFile?: string;
  };
};
