/**
 * Util for creating user model config
 */
export class UserModelConfig {
    static stepUserLoopN({ maxUsers, rampUpTime, steps, runNTimes, delayTime, }) {
        return {
            maxUsers,
            rampUpTime,
            steps,
            holdTime: 0,
            delayTime,
            userRunMode: "RUN_N" /* RUN_N */,
            runNTimes,
            endMode: "WAIT_USER_DONE" /* ALL_USER_DONE */,
        };
    }
    static stepUserForTime({ maxUsers, rampUpTime, steps, holdTime, delayTime, }) {
        return {
            maxUsers,
            rampUpTime,
            steps,
            holdTime,
            delayTime,
            userRunMode: "RUN_FOREVER" /* RUN_FOREVER */,
            endMode: "RUN_TIME" /* RUN_TIME */,
        };
    }
    static userLoopN({ maxUsers, runNTimes, delayTime }) {
        return {
            maxUsers,
            rampUpTime: 0,
            steps: 1,
            holdTime: 0,
            delayTime,
            userRunMode: "RUN_N" /* RUN_N */,
            runNTimes,
            endMode: "WAIT_USER_DONE" /* ALL_USER_DONE */,
        };
    }
    static userLoopForTime({ maxUsers, holdTime, delayTime }) {
        return {
            maxUsers,
            rampUpTime: 0,
            steps: 1,
            holdTime,
            delayTime,
            userRunMode: "RUN_FOREVER" /* RUN_FOREVER */,
            endMode: "RUN_TIME" /* RUN_TIME */,
        };
    }
}
//# sourceMappingURL=UserModelConfig.js.map