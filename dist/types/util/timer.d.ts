/**
 * Timer class to measure time duration
 */
export declare class Timer {
    _status: STATUS;
    _startTick: [number, number] | null;
    _stopTick: [number, number] | null;
    constructor();
    start(): Timer;
    stop(): Timer;
    get duration(): number;
}
declare const enum STATUS {
    INIT = "INIT",
    START = "START",
    STOP = "STOP"
}
export {};
