import { DEFAULT_CONFIG_VALE } from "./StepUserModel.js";
export class UserJourneyRunN {
    constructor(stepUserModel) {
        this.stepUserModel = stepUserModel;
    }
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser, runScenario) {
        return async () => {
            const { userId, userContext } = await spawnUser();
            for (let k = 0; k < (this.stepUserModel._config.runNTimes ?? DEFAULT_CONFIG_VALE.runNTimes); k++) {
                if (this.stepUserModel._state !== "RUNNING" /* RUNNING */) {
                    break;
                }
                await runScenario({ userId, userContext });
            }
        };
    }
}
export class UserJourneyRunForever {
    constructor(stepUserModel) {
        this.stepUserModel = stepUserModel;
    }
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser, runScenario) {
        return async () => {
            const { userId, userContext } = await spawnUser();
            while (this.stepUserModel._state === "RUNNING" /* RUNNING */) {
                await runScenario({ userId, userContext });
            }
        };
    }
}
export class UserJourneyRunOnce {
    constructor(stepUserModel) {
        this.stepUserModel = stepUserModel;
    }
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser, runScenario) {
        return async () => {
            const { userId, userContext } = await spawnUser();
            await runScenario({ userId, userContext });
        };
    }
}
//# sourceMappingURL=UserJouney.js.map