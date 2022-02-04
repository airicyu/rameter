import { EventEmitter } from "events";
import { ResultAnalyzer, Config as BaseConfig } from "./ResultAnalyzer.js";

export class DefaultResultAnalyzer implements ResultAnalyzer {
  _config: Config;

  _startTime?: number;
  _summary: { [key: string]: SummaryRecord } = {};
  _lastTickTime = 0;
  _tickSummary: { [key: string]: SummaryRecord } = {};
  distributeRecords: DistributeRecords = {};

  constructor(config: Config, _masterEvent: EventEmitter) {
    this._config = config ?? {};
    _masterEvent.once("master:command:run-test", () => {
      this._startTime = Date.now();
    });
    _masterEvent.on("master:sample-records:store", (sampleRecords: SampleRecord[]) => {
      this.processRecordsToSummary(sampleRecords);
      this.processRecordsToTickSummary(sampleRecords);
    });
  }

  async init() {}

  async processRecordsToSummary(sampleRecords: SampleRecord[]) {
    for (const record of sampleRecords) {
      if (!this._summary[record.label]) {
        this._summary[record.label] = {
          label: record.label,
          startTime: this._startTime ?? Date.now(),
          count: 0,
          success: 0,
          fail: 0,
          min: -1,
          max: -1,
          average: 0,
          percentile: {
            p25: undefined,
            p50: undefined,
            p75: undefined,
            p90: undefined,
            p95: undefined,
          },
        };
      }

      const summary = this._summary[record.label];
      summary.count++;
      if (record.success) {
        summary.success++;
      } else {
        summary.fail++;
      }
      if (typeof record.durationMs === "number" && record.durationMs !== null) {
        if (summary.min < 0 || record.durationMs < summary.min) {
          summary.min = record.durationMs;
        }
        if (summary.max < 0 || record.durationMs > summary.max) {
          summary.max = record.durationMs;
        }
        summary.average = summary.average + (record.durationMs - summary.average) / summary.count;
      }

      if (record.durationMs !== null) {
        const { min, max } = this.getDistBlanket(record.durationMs);

        this.distributeRecords[record.label] = this.distributeRecords[record.label] ?? {};

        const distMap = this.distributeRecords[record.label];

        distMap[min] = distMap[min] ?? {
          min,
          max,
          count: 0,
        };

        distMap[min].count++;
      }
    }
  }

  async processRecordsToTickSummary(sampleRecords: SampleRecord[]) {
    this._lastTickTime = this._lastTickTime || Date.now();

    for (const record of sampleRecords) {
      if (!this._tickSummary[record.label]) {
        this._tickSummary[record.label] = {
          label: record.label,
          startTime: this._startTime ?? Date.now(),
          count: 0,
          success: 0,
          fail: 0,
          min: -1,
          max: -1,
          average: 0,
        };
      }

      const summary = this._tickSummary[record.label];
      summary.count++;
      if (record.success) {
        summary.success++;
      } else {
        summary.fail++;
      }
      if (typeof record.durationMs === "number" && record.durationMs !== null) {
        if (summary.min < 0 || record.durationMs < summary.min) {
          summary.min = record.durationMs;
        }
        if (summary.max < 0 || record.durationMs > summary.max) {
          summary.max = record.durationMs;
        }
        summary.average = summary.average + (record.durationMs - summary.average) / summary.count;
      }
    }
  }

  async tickAndAnalyzeFromLastTick(): Promise<{
    tickSummary: Summary;
    lastTickTime: number;
    thisTickTime: number;
  }> {
    const tickSummary = this._tickSummary;
    const lastTickTime = this._lastTickTime;
    const thisTickTime = Date.now();
    this._tickSummary = {};
    this._lastTickTime = thisTickTime;

    return {
      tickSummary,
      lastTickTime,
      thisTickTime,
    };
  }

  async analyzeIntermediateResult(): Promise<{ startTime: number; summary: Summary }> {
    for (const [label, distRecord] of Object.entries(this.distributeRecords)) {
      const distBlankets = Object.values(distRecord).sort((a, b) => a.min - b.min);
      const totalRecords = distBlankets.map((_) => _.count).reduce((prev, curr) => prev + curr);

      this._summary[label].percentile = {
        p25: this.calDistBlanketsPercentile(distBlankets, totalRecords, 25),
        p50: this.calDistBlanketsPercentile(distBlankets, totalRecords, 50),
        p75: this.calDistBlanketsPercentile(distBlankets, totalRecords, 75),
        p90: this.calDistBlanketsPercentile(distBlankets, totalRecords, 90),
        p95: this.calDistBlanketsPercentile(distBlankets, totalRecords, 95),
      };
    }
    return {
      startTime: this._startTime ?? 0,
      summary: this._summary,
    };
  }

  async analyze(): Promise<Summary> {
    //TODO real cal percentile instead of estimate value
    for (const [label, distRecord] of Object.entries(this.distributeRecords)) {
      const distBlankets = Object.values(distRecord).sort((a, b) => a.min - b.min);
      const totalRecords = distBlankets.map((_) => _.count).reduce((prev, curr) => prev + curr);

      this._summary[label].percentile = {
        p25: this.calDistBlanketsPercentile(distBlankets, totalRecords, 25),
        p50: this.calDistBlanketsPercentile(distBlankets, totalRecords, 50),
        p75: this.calDistBlanketsPercentile(distBlankets, totalRecords, 75),
        p90: this.calDistBlanketsPercentile(distBlankets, totalRecords, 90),
        p95: this.calDistBlanketsPercentile(distBlankets, totalRecords, 95),
      };
    }
    return this._summary;
  }

  calDistBlanketsPercentile(blankets: { min: number; max: number; count: number }[], totalRecords: number, percentile: number) {
    let pendingReadRecords = Math.ceil((totalRecords * percentile) / 100);
    for (let i = 0; i < blankets.length; i++) {
      if (blankets[i].count >= pendingReadRecords) {
        return blankets[i].max;
      } else {
        pendingReadRecords -= blankets[i].count;
      }
    }
    return blankets[blankets.length - 1].max;
  }

  getDistBlanket(durationMs: number) {
    if (durationMs < 10) {
      // 0-9.999 ms -> x ms
      durationMs = +durationMs.toFixed(0);
      return { min: durationMs, max: +(durationMs + 1).toFixed(0) };
    }

    durationMs = +durationMs.toFixed(0);
    if (durationMs < 100) {
      // 10-99 ms -> x ms
      return { min: durationMs, max: durationMs + 1 };
    } else if (durationMs < 1000) {
      // 100-999 ms -> 0.xx s
      return {
        min: durationMs - (durationMs % 10),
        max: durationMs - (durationMs % 10) + 10,
      };
    } else {
      // > 1s -> 1.x s
      return {
        min: durationMs - (durationMs % 100),
        max: durationMs - (durationMs % 100) + 100,
      };
    }
  }
}

type DistributeRecords = {
  [key: string]: {
    [key: string]: { min: number; max: number; count: number };
  };
};

export type Config = {} & BaseConfig;
