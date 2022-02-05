/**
 * A wrapper function to run code. And it would stop begin to run if there are already error happened.
 */
export class Stepper {
  _errorControl: ErrorControl;

  constructor(errorControl: ErrorControl) {
    this._errorControl = errorControl;
  }

  isError() {
    return this._errorControl.error;
  }

  async run(code: (...args: any) => any) {
    const run = this._errorControl.isRun();

    if (run) {
      try {
        await code();
      } catch (error) {
        this._errorControl.errorInc();
      }
    }

    return this;
  }
}

export const enum ErrorHandleMode {
  IGNORE = "IGNORE",
  STOP = "STOP",
  STOP_AFTER_THERSHOLD = "STOP_AFTER_THERSHOLD",
}

export class ErrorControl {
  _error = false;
  _errorHandleMode: ErrorHandleMode = ErrorHandleMode.IGNORE;
  _errorThershold = 0;
  _errorCount = 0;

  static IGNORE = new ErrorControl(ErrorHandleMode.IGNORE);

  static STOP = new ErrorControl(ErrorHandleMode.STOP);

  private constructor(errorHandleMode: ErrorHandleMode = ErrorHandleMode.IGNORE) {
    this.setErrorHandleMode(errorHandleMode);
  }

  static STOP_AFTER_THERSHOLD(n: number) {
    const erroControl = new ErrorControl(ErrorHandleMode.STOP_AFTER_THERSHOLD);
    erroControl.setErrorThershold(n);
    return erroControl;
  }

  isRun(): boolean {
    if (this.error) {
      if (this.errorHandle === ErrorHandleMode.IGNORE) {
        return true;
      } else if (this.errorHandle === ErrorHandleMode.STOP) {
        return false;
      } else if (this.errorHandle === ErrorHandleMode.STOP_AFTER_THERSHOLD) {
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

  setErrorHandleMode(errorHandleMode: ErrorHandleMode) {
    this._errorHandleMode = errorHandleMode;
  }

  setErrorThershold(errorThershold: number) {
    this._errorThershold = errorThershold;
  }

  errorInc() {
    this._errorCount++;
    this._error = true;
  }
}
