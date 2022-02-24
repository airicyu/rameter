import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
/**
 * Default implementation of SampleForwarder.
 *
 * It would send back sample result to Master via websocket.
 * It has some kind of internal buffering to flush send when "every N samples buffered or T seconds passed".
 */
export class DefaultSampleForwarder {
    constructor(config, workerNode) {
        this._event = new EventEmitter();
        this._bufferRecords = [];
        this._lastForwardTime = 0;
        this._state = "IDLE" /* IDLE */;
        this._config = config ?? {};
        workerNode.event.on("worker-node:up", () => {
            this._socket = workerNode.getIOChannelSocket();
        });
        workerNode.event.on("worker-node:shutdown", this.down);
        this._deferTrigger = new DeferTrigger();
    }
    async forward(records, forceFlush = false) {
        if (records.length > 0) {
            this._bufferRecords.push(...records);
        }
        if (this._state === "IDLE" /* IDLE */) {
            if (forceFlush || Date.now() - this._lastForwardTime >= this.batchTimeThershold || this._bufferRecords.length >= this.batchRecordThershold) {
                this._state = "FORWARDING" /* FORWARDING */; // locking and prevent mutual writing
                this._deferTrigger?.cancelTrigger();
                await this.forwardBufferToMaster();
                this._state = "IDLE" /* IDLE */; // release lock
                this._event.emit("idle");
            }
            else {
                // just not yet time to forward... pls wait
            }
        }
        else if (this._state === "FORWARDING" /* FORWARDING */) {
            // busying... keep waiting
        }
        // waiting to forward
        if (this._bufferRecords.length > 0) {
            this._deferTrigger?.deferTriggerOnce(async () => {
                await this.flush();
            }, this._config.batchTimeThershold ?? 5000);
        }
        return true;
    }
    /**
     * trigger flush of buffer,
     * if it is busying, then would wait to flush.
     */
    async flush() {
        if (this._state === "IDLE" /* IDLE */) {
            await this.forward([], true);
            return true;
        }
        else {
            //forward
            return new Promise((resolve) => {
                this._event.once("idle", async () => {
                    if (this._state === "IDLE" /* IDLE */) {
                        await this.forward([], true);
                        resolve(true);
                    }
                    else {
                        //somehow others triggered the flush, we dun need to duplicate run
                        resolve(false);
                    }
                });
            });
        }
    }
    /**
     * underlining function to physically forward buffered records
     */
    async forwardBufferToMaster() {
        // swap buffer first, prevent mutual pushing new records to buffer while writing
        const buffer = this._bufferRecords;
        this._bufferRecords = [];
        this._lastForwardTime = Date.now();
        if (buffer.length > 0) {
            this._socket?.emit("worker-node:sample-records.push", buffer);
        }
        return;
    }
    get batchRecordThershold() {
        return this._config.batchRecordThershold ?? DEFAULT_CONFIG.batchRecordThershold;
    }
    get batchTimeThershold() {
        return this._config.batchTimeThershold ?? DEFAULT_CONFIG.batchTimeThershold;
    }
    down() { }
}
export const DEFAULT_CONFIG = {
    batchRecordThershold: 100,
    batchTimeThershold: 5000,
};
//# sourceMappingURL=DefaultSampleForwarder.js.map