/**
 * A wrapper function to run code. And it would stop begin to run if there are already error happened.
 */
export declare class Stepper {
    _errorControl: ErrorControl;
    constructor(errorControl: ErrorControl);
    isError(): boolean;
    run(code: (...args: any) => any): Promise<this>;
}
export declare const enum ErrorHandleMode {
    IGNORE = "IGNORE",
    STOP = "STOP",
    STOP_AFTER_THERSHOLD = "STOP_AFTER_THERSHOLD"
}
export declare class ErrorControl {
    _error: boolean;
    _errorHandleMode: ErrorHandleMode;
    _errorThershold: number;
    _errorCount: number;
    static IGNORE: ErrorControl;
    static STOP: ErrorControl;
    private constructor();
    static STOP_AFTER_THERSHOLD(n: number): ErrorControl;
    isRun(): boolean;
    get error(): boolean;
    get errorHandle(): ErrorHandleMode;
    setErrorHandleMode(errorHandleMode: ErrorHandleMode): void;
    setErrorThershold(errorThershold: number): void;
    errorInc(): void;
}
