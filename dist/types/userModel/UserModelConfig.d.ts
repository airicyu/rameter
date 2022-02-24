import { Config as StepUserModelConfig } from "./StepUserModel.js";
/**
 * Util for creating user model config
 */
export declare class UserModelConfig {
    static stepUserLoopN({ maxUsers, rampUpTime, steps, runNTimes, delayTime, }: {
        maxUsers: number;
        rampUpTime: number;
        steps: number;
        runNTimes?: number;
        delayTime?: number;
    }): StepUserModelConfig;
    static stepUserForTime({ maxUsers, rampUpTime, steps, holdTime, delayTime, }: {
        maxUsers: number;
        rampUpTime: number;
        steps: number;
        holdTime: number;
        delayTime?: number;
    }): StepUserModelConfig;
    static userLoopN({ maxUsers, runNTimes, delayTime }: {
        maxUsers: number;
        runNTimes?: number;
        delayTime?: number;
    }): StepUserModelConfig;
    static userLoopForTime({ maxUsers, holdTime, delayTime }: {
        maxUsers: number;
        holdTime: number;
        delayTime?: number;
    }): StepUserModelConfig;
}
