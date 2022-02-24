/**
 * Timer class to measure time duration
 */
export class Timer {
    constructor() {
        this._status = "INIT" /* INIT */;
        this._startTick = null;
        this._stopTick = null;
    }
    start() {
        this._status = "START" /* START */;
        this._startTick = process.hrtime();
        return this;
    }
    stop() {
        if (this._startTick) {
            this._status = "STOP" /* STOP */;
            this._stopTick = process.hrtime(this._startTick);
        }
        return this;
    }
    get duration() {
        if (this._status === "STOP" /* STOP */) {
            if (!this._stopTick) {
                throw new Error("No stop tick!");
            }
            return (this._stopTick[0] * 1e9 + this._stopTick[1]) / 1e6;
        }
        else if (this._status === "START" /* START */) {
            if (!this._startTick) {
                throw new Error("No start tick!");
            }
            const tempStopTick = process.hrtime(this._startTick);
            return (tempStopTick[0] * 1e9 + tempStopTick[1]) / 1e6;
        }
        else {
            return -1;
        }
    }
}
//# sourceMappingURL=timer.js.map