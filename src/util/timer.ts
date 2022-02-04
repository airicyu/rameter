export class Timer {
  _status: STATUS = STATUS.INIT;
  _startTick: [number, number] | null = null;
  _stopTick: [number, number] | null = null;

  constructor() {}

  start(): Timer {
    this._status = STATUS.START;
    this._startTick = process.hrtime();
    return this;
  }

  stop(): Timer {
    if (this._startTick) {
      this._status = STATUS.STOP;
      this._stopTick = process.hrtime(this._startTick);
    }
    return this;
  }

  get duration(): number {
    if (this._status === STATUS.STOP) {
      if (!this._stopTick) {
        throw new Error("No stop tick!");
      }
      return (this._stopTick[0] * 1e9 + this._stopTick[1]) / 1e6;
    } else if (this._status === STATUS.START) {
      if (!this._startTick) {
        throw new Error("No start tick!");
      }
      const tempStopTick = process.hrtime(this._startTick);
      return (tempStopTick[0] * 1e9 + tempStopTick[1]) / 1e6;
    } else {
      return -1;
    }
  }
}

const enum STATUS {
  INIT = "INIT",
  START = "START",
  STOP = "STOP",
}
