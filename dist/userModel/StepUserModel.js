import { sleep } from "../util/sleep.js";
import { UserJourneyRunForever, UserJourneyRunN, UserJourneyRunOnce } from "./UserJouney.js";
/**
 * User model control (step model)
 */
export class StepUserModel {
    constructor(config) {
        this._state = "INIT" /* INIT */;
        this._config = config;
        switch (config.userRunMode) {
            case "RUN_FOREVER" /* RUN_FOREVER */:
                this._userJourney = new UserJourneyRunForever(this);
                break;
            case "RUN_N" /* RUN_N */:
                this._userJourney = new UserJourneyRunN(this);
                break;
            case "RUN_ONCE" /* RUN_ONCE */:
                this._userJourney = new UserJourneyRunOnce(this);
                break;
        }
    }
    /**
     * hook for test stop.
     * the STATE would passively stopping the "run forever" loops
     */
    async onTestStop() {
        this._state = "STOP" /* STOP */;
    }
    async run({ spawnUser, runScenario, finishUser, }) {
        this._state = "RUNNING" /* RUNNING */;
        // calculate each step span how much users
        const stepNumUser = this.calculateStepNumUsers();
        const stepTime = ((this._config.rampUpTime ?? DEFAULT_CONFIG_VALE.rampUpTime) * 1000) / (this._config.steps ?? DEFAULT_CONFIG_VALE.steps);
        const userJourneys = [];
        await sleep((this._config.delayTime ?? DEFAULT_CONFIG_VALE.delayTime) * 1000);
        // for N steps
        for (let i = 0; i < (this._config.steps ?? DEFAULT_CONFIG_VALE.steps); i++) {
            // spawn step users
            for (let j = 0; j < stepNumUser[i]; j++) {
                // async spawn run without awaiting back;
                const userJourneyRun = this._userJourney.getUserJourney(spawnUser, runScenario)().finally(finishUser);
                // we may wait for user journeys to finish
                userJourneys.push(userJourneyRun);
            }
            await sleep(stepTime);
        }
        const waitHoldTime = sleep((this._config.holdTime ?? DEFAULT_CONFIG_VALE.holdTime) * 1000);
        switch (this._config.endMode) {
            case "WAIT_USER_DONE" /* ALL_USER_DONE */:
                await Promise.all(userJourneys);
                break;
            case "RUN_TIME_OR_ALL_USER_DONE" /* RUN_TIME_OR_ALL_USER_DONE */:
                await Promise.race([waitHoldTime, Promise.all(userJourneys)]);
                break;
            case "RUN_TIME" /* RUN_TIME */:
            default:
                await waitHoldTime;
                break;
        }
        this._state = "STOP" /* STOP */;
        return;
    }
    calculateStepNumUsers() {
        let stepNumUser = [];
        for (let i = 0; i < (this._config.steps ?? DEFAULT_CONFIG_VALE.steps); i++) {
            stepNumUser[i] = Math.round((this._config.maxUsers * (i + 1)) / (this._config.steps ?? DEFAULT_CONFIG_VALE.steps));
        }
        stepNumUser = stepNumUser.map((val, i) => {
            if (i === 0)
                return val;
            return val - stepNumUser[i - 1];
        });
        return stepNumUser;
    }
}
export const DEFAULT_CONFIG_VALE = {
    steps: 1,
    delayTime: 0,
    rampUpTime: 0,
    holdTime: 0,
    runNTimes: 1,
    endMode: "WAIT_USER_DONE" /* ALL_USER_DONE */,
};
//# sourceMappingURL=StepUserModel.js.map