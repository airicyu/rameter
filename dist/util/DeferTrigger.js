/**
 * Util for defer trigger something.
 *
 * It is used for implementation defer flush mechanisms in other classes.
 */
export class DeferTrigger {
    constructor() {
        this._lastTriggerTime = 0;
        this._delayTriggerTimer = null;
    }
    deferTriggerOnce(code, delayTime) {
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
    cancelTrigger() {
        if (this._delayTriggerTimer) {
            clearTimeout(this._delayTriggerTimer);
        }
        this._delayTriggerTimer = null;
    }
    isPending() {
        return !!this._delayTriggerTimer;
    }
}
//# sourceMappingURL=DeferTrigger.js.map