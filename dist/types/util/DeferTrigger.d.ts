/// <reference types="node" />
/**
 * Util for defer trigger something.
 *
 * It is used for implementation defer flush mechanisms in other classes.
 */
export declare class DeferTrigger {
    _delayTime?: number;
    _lastTriggerTime: number;
    _delayTriggerTimer: NodeJS.Timeout | null;
    _code?: () => Promise<void>;
    constructor();
    deferTriggerOnce(code: () => Promise<void>, delayTime: number): void;
    cancelTrigger(): void;
    isPending(): boolean;
}
