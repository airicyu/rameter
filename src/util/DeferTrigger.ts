/**
 * Util for defer trigger something.
 *
 * It is used for implementation defer flush mechanisms in other classes.
 */
export class DeferTrigger {
  _delayTime?: number;
  _lastTriggerTime = 0;
  _delayTriggerTimer: NodeJS.Timeout | null = null;
  _code?: () => Promise<void>;

  constructor() {}

  deferTriggerOnce(code: () => Promise<void>, delayTime: number): void {
    if (!this._delayTriggerTimer) {
      this._delayTime = delayTime;
      this._code = code;

      // console.log("create delay trigger");
      this._delayTriggerTimer = setTimeout(() => {
        this._delayTriggerTimer = null; // remove timer
        // console.log("trigger delay trigger");
        this._code?.();
      }, this._delayTime ?? 0);
    }
  }

  cancelTrigger(): void {
    if (this._delayTriggerTimer) {
      clearTimeout(this._delayTriggerTimer);
    }
    this._delayTriggerTimer = null;
  }

  isPending(): boolean {
    return !!this._delayTriggerTimer;
  }
}
