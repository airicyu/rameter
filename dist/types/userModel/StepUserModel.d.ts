import { UserJourney } from "./UserJouney.js";
/**
 * User model control (step model)
 */
export declare class StepUserModel {
    _config: Config;
    _state: State;
    _userJourney: UserJourney;
    constructor(config: Config);
    /**
     * hook for test stop.
     * the STATE would passively stopping the "run forever" loops
     */
    onTestStop(): Promise<void>;
    run({ spawnUser, runScenario, finishUser, }: {
        spawnUser: () => Promise<{
            userId: string;
            userContext: any;
        }>;
        runScenario: ({ userId, userContext }: {
            userId: string;
            userContext: any;
        }) => Promise<void>;
        finishUser: () => void;
    }): Promise<void>;
    calculateStepNumUsers(): number[];
}
export declare type Config = {
    maxUsers: number;
    steps?: number;
    rampUpTime?: number;
    holdTime?: number;
    delayTime?: number;
    userRunMode: UserRunMode;
    runNTimes?: number;
    endMode?: EndMode;
};
export declare const DEFAULT_CONFIG_VALE: {
    steps: number;
    delayTime: number;
    rampUpTime: number;
    holdTime: number;
    runNTimes: number;
    endMode: EndMode;
};
export declare const enum UserRunMode {
    RUN_ONCE = "RUN_ONCE",
    RUN_N = "RUN_N",
    RUN_FOREVER = "RUN_FOREVER"
}
export declare const enum EndMode {
    RUN_TIME = "RUN_TIME",
    ALL_USER_DONE = "WAIT_USER_DONE",
    RUN_TIME_OR_ALL_USER_DONE = "RUN_TIME_OR_ALL_USER_DONE"
}
export declare const enum State {
    INIT = "INIT",
    RUNNING = "RUNNING",
    STOP = "STOP"
}
