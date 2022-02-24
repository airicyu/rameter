import fs, { appendFile } from "fs";
import { stringify } from "csv-stringify";
import { defaultSampleHeaders } from "../../sample/SampleRecordFactory.js";
import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
/**
 * Default implementation of ResultStore.
 *
 * Storing result in result file.
 * It has some kind of internal buffering to flush write when "every N samples buffered or T seconds passed".
 */
export class FileResultStore {
    constructor(config = {}) {
        this._bufferRecords = [];
        this._lastWriteTime = 0;
        this._state = "IDLE" /* IDLE */;
        this._csvColumns = [];
        this._event = new EventEmitter();
        this._config = config;
        this._deferTrigger = new DeferTrigger();
    }
    async init() {
        const headers = [...defaultSampleHeaders, ...(this._config.extraFields ?? [])];
        fs.writeFileSync(this.outFile, headers.join(",") + "\n", "utf-8");
        this._csvColumns = headers.map((_) => {
            return { key: _ };
        });
        return;
    }
    async store(records, forceFlush = false) {
        if (records.length > 0) {
            this._bufferRecords.push(...records);
        }
        if (this._state === "IDLE" /* IDLE */) {
            if (forceFlush || Date.now() - this._lastWriteTime >= this.batchTimeThershold || this._bufferRecords.length >= this.batchRecordThershold) {
                this._state = "WRITING" /* WRITING */; // locking and prevent mutual writing
                this._deferTrigger?.cancelTrigger();
                await this.flushBufferToFile();
                this._state = "IDLE" /* IDLE */; // release lock
                this._event.emit("idle");
            }
            else {
                // just not yet time to write... pls wait
            }
        }
        else if (this._state === "WRITING" /* WRITING */) {
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
    async flushStore() {
        if (this._state === "IDLE" /* IDLE */) {
            await this.store([], true);
            return true;
        }
        else {
            //writing
            return new Promise((resolve) => {
                this._event.once("idle", async () => {
                    if (this._state === "IDLE" /* IDLE */) {
                        await this.store([], true);
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        }
    }
    get batchRecordThershold() {
        return this._config.batchRecordThershold ?? DEFAULT_CONFIG.batchRecordThershold;
    }
    get batchTimeThershold() {
        return this._config.batchTimeThershold ?? DEFAULT_CONFIG.batchTimeThershold;
    }
    get outFile() {
        return this._config.outFile ?? DEFAULT_CONFIG.outFile;
    }
    async flushBufferToFile() {
        // swap buffer first, prevent mutual pushing new records to buffer while writing
        const buffer = this._bufferRecords.map((record) => {
            const { testMeta, ...recordBase } = record;
            return { ...recordBase, ...testMeta };
        });
        this._bufferRecords = [];
        this._lastWriteTime = Date.now();
        return new Promise((resolve, reject) => {
            stringify(buffer, {
                columns: this._csvColumns,
                quoted_string: true,
            }, (err, data) => {
                if (err) {
                    return reject(err);
                }
                appendFile(this.outFile, data, "utf8", (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        });
    }
}
const DEFAULT_CONFIG = {
    batchRecordThershold: 100,
    batchTimeThershold: 5000,
    outFile: "./result.csv",
};
//# sourceMappingURL=FileResultStore.js.map