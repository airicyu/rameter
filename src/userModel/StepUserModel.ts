import { sleep } from "../util/sleep.js";
import { UserJourney, UserJourneyRunForever, UserJourneyRunN, UserJourneyRunOnce } from "./UserJouney.js";

/**
 * User model control (step model)
 */
export class StepUserModel {
  _config: Config;
  _state: State = State.INIT;
  _userJourney: UserJourney;

  constructor(config: Config) {
    this._config = config;
    switch (config.userRunMode) {
      case UserRunMode.RUN_FOREVER:
        this._userJourney = new UserJourneyRunForever(this);
        break;
      case UserRunMode.RUN_N:
        this._userJourney = new UserJourneyRunN(this);
        break;
      case UserRunMode.RUN_ONCE:
        this._userJourney = new UserJourneyRunOnce(this);
        break;
    }
  }

  /**
   * hook for test stop.
   * the STATE would passively stopping the "run forever" loops
   */
  async onTestStop() {
    this._state = State.STOP;
  }

  async run({
    spawnUser,
    runScenario,
    finishUser,
  }: {
    spawnUser: () => Promise<{ userId: string; userContext: any }>;
    runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void>;
    finishUser: () => void;
  }) {
    this._state = State.RUNNING;

    // calculate each step span how much users
    const stepNumUser: number[] = this.calculateStepNumUsers();

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
      case EndMode.ALL_USER_DONE:
        await Promise.all(userJourneys);
        break;
      case EndMode.RUN_TIME_OR_ALL_USER_DONE:
        await Promise.race([waitHoldTime, Promise.all(userJourneys)]);
        break;
      case EndMode.RUN_TIME:
      default:
        await waitHoldTime;
        break;
    }
    this._state = State.STOP;
    return;
  }

  calculateStepNumUsers(): number[] {
    let stepNumUser: number[] = [];
    for (let i = 0; i < (this._config.steps ?? DEFAULT_CONFIG_VALE.steps); i++) {
      stepNumUser[i] = Math.round((this._config.maxUsers * (i + 1)) / (this._config.steps ?? DEFAULT_CONFIG_VALE.steps));
    }
    stepNumUser = stepNumUser.map((val, i) => {
      if (i === 0) return val;
      return val - stepNumUser[i - 1];
    });

    return stepNumUser;
  }
}

export type Config = {
  maxUsers: number;
  steps?: number;
  rampUpTime?: number;
  holdTime?: number;
  delayTime?: number;
  userRunMode: UserRunMode;
  runNTimes?: number;
  endMode?: EndMode;
};

export const DEFAULT_CONFIG_VALE = {
  steps: 1,
  delayTime: 0,
  rampUpTime: 0,
  holdTime: 0,
  runNTimes: 1,
  endMode: EndMode.ALL_USER_DONE,
};

export const enum UserRunMode {
  RUN_ONCE = "RUN_ONCE",
  RUN_N = "RUN_N",
  RUN_FOREVER = "RUN_FOREVER",
}

export const enum EndMode {
  RUN_TIME = "RUN_TIME",
  ALL_USER_DONE = "WAIT_USER_DONE",
  RUN_TIME_OR_ALL_USER_DONE = "RUN_TIME_OR_ALL_USER_DONE",
}

export const enum State {
  INIT = "INIT",
  RUNNING = "RUNNING",
  STOP = "STOP",
}
