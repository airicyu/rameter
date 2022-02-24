/**
 * A wrapper function to run code. And it would stop begin to run if there are already error happened.
 */
export class Stepper {
    constructor(errorControl) {
        this._errorControl = errorControl;
    }
    isError() {
        return this._errorControl.error;
    }
    async run(code) {
        const run = this._errorControl.isRun();
        if (run) {
            try {
                await code();
            }
            catch (error) {
                this._errorControl.errorInc();
            }
        }
        return this;
    }
}
export class ErrorControl {
    constructor(errorHandleMode = "IGNORE" /* IGNORE */) {
        this._error = false;
        this._errorHandleMode = "IGNORE" /* IGNORE */;
        this._errorThershold = 0;
        this._errorCount = 0;
        this.setErrorHandleMode(errorHandleMode);
    }
    static STOP_AFTER_THERSHOLD(n) {
        const erroControl = new ErrorControl("STOP_AFTER_THERSHOLD" /* STOP_AFTER_THERSHOLD */);
        erroControl.setErrorThershold(n);
        return erroControl;
    }
    isRun() {
        if (this.error) {
            if (this.errorHandle === "IGNORE" /* IGNORE */) {
                return true;
            }
            else if (this.errorHandle === "STOP" /* STOP */) {
                return false;
            }
            else if (this.errorHandle === "STOP_AFTER_THERSHOLD" /* STOP_AFTER_THERSHOLD */) {
                return this._errorCount >= this._errorThershold;
            }
        }
        return true;
    }
    get error() {
        return this._error;
    }
    get errorHandle() {
        return this._errorHandleMode;
    }
    setErrorHandleMode(errorHandleMode) {
        this._errorHandleMode = errorHandleMode;
    }
    setErrorThershold(errorThershold) {
        this._errorThershold = errorThershold;
    }
    errorInc() {
        this._errorCount++;
        this._error = true;
    }
}
ErrorControl.IGNORE = new ErrorControl("IGNORE" /* IGNORE */);
ErrorControl.STOP = new ErrorControl("STOP" /* STOP */);
//# sourceMappingURL=Stepper.js.map