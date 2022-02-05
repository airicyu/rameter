import fs, { appendFile } from "fs";
import { stringify } from "csv-stringify";
import { defaultSampleHeaders } from "../../sample/SampleRecordFactory.js";
import type { ResultStore, Config as BaseConfig } from "./ResultStore.js";
import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
import type { SampleRecord } from "../../sharedTypes.js";

/**
 * Default implementation of ResultStore.
 *
 * Storing result in result file.
 * It has some kind of internal buffering to flush write when "every N samples buffered or T seconds passed".
 */
export class FileResultStore implements ResultStore {
  _config: Config;
  _bufferRecords: SampleRecord[] = [];
  _lastWriteTime = 0;

  _state: State = State.IDLE;

  _csvColumns: { key: string }[] = [];

  _deferTrigger: DeferTrigger;

  _event = new EventEmitter();

  constructor(config: Config = {}) {
    this._config = config;
    this._deferTrigger = new DeferTrigger();
  }

  async init(): Promise<void> {
    const headers = [...defaultSampleHeaders, ...(this._config.extraFields ?? [])];

    fs.writeFileSync(this.outFile, headers.join(",") + "\n", "utf-8");
    this._csvColumns = headers.map((_) => {
      return { key: _ };
    });
    return;
  }

  async store(records: SampleRecord[], forceFlush = false): Promise<boolean> {
    if (records.length > 0) {
      this._bufferRecords.push(...records);
    }

    if (this._state === State.IDLE) {
      if (forceFlush || Date.now() - this._lastWriteTime >= this.batchTimeThershold || this._bufferRecords.length >= this.batchRecordThershold) {
        this._state = State.WRITING; // locking and prevent mutual writing

        this._deferTrigger?.cancelTrigger();
        await this.flushBufferToFile();

        this._state = State.IDLE; // release lock

        this._event.emit("idle");
      } else {
        // just not yet time to write... pls wait
      }
    } else if (this._state === State.WRITING) {
      // busying... keep waiting
    }

    // waiting to write
    if (this._bufferRecords.length > 0) {
      this._deferTrigger?.deferTriggerOnce(async () => {
        await this.flushStore();
      }, this._config.batchTimeThershold ?? 5000);
    }
    return true;
  }

  async flushStore(): Promise<boolean> {
    if (this._state === State.IDLE) {
      await this.store([], true);
      return true;
    } else {
      //writing
      return new Promise<boolean>((resolve) => {
        this._event.once("idle", async () => {
          if (this._state === State.IDLE) {
            await this.store([], true);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    }
  }

  get batchRecordThershold() {
    return this._config.batchRecordThershold ?? defaultConfig.batchRecordThershold;
  }

  get batchTimeThershold() {
    return this._config.batchTimeThershold ?? defaultConfig.batchTimeThershold;
  }

  get outFile() {
    return this._config.outFile ?? defaultConfig.outFile;
  }

  async flushBufferToFile(): Promise<boolean> {
    // swap buffer first, prevent mutual pushing new records to buffer while writing
    const buffer = this._bufferRecords.map((record) => {
      const { testMeta, ...recordBase } = record;
      return { ...recordBase, ...testMeta };
    });
    this._bufferRecords = [];
    this._lastWriteTime = Date.now();

    return new Promise((resolve, reject) => {
      stringify(
        buffer,
        {
          columns: this._csvColumns,
          quoted_string: true,
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          appendFile(this.outFile, data, "utf8", (err) => {
            if (err) {
              return reject(err);
            }
            resolve(true);
          });
        }
      );
    });
  }
}

const enum State {
  IDLE = "IDLE",
  WRITING = "WRITING",
}

const defaultConfig = {
  batchRecordThershold: 100,
  batchTimeThershold: 5000,
  outFile: "./result.csv",
};

export type Config = {
  batchRecordThershold?: number;
  batchTimeThershold?: number;
  outFile?: string;
  extraFields?: string[];
} & BaseConfig;
