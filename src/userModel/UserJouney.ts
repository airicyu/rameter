import { StepUserModel, State } from "./StepUserModel.js";

/**
 * The common interface for different ways to run user journey:
 * - run once
 * - run N times
 * - run forever
 */
export interface UserJourney {
  getUserJourney(
    spawnUser: () => Promise<{ userId: string; userContext: any }>,
    runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void>
  ): () => Promise<void>;
}

export class UserJourneyRunN implements UserJourney {
  stepUserModel: StepUserModel;

  constructor(stepUserModel: StepUserModel) {
    this.stepUserModel = stepUserModel;
  }

  /**
   * return User Journey async function
   */
  getUserJourney(
    spawnUser: () => Promise<{ userId: string; userContext: any }>,
    runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void>
  ): () => Promise<void> {
    return async () => {
      const { userId, userContext } = await spawnUser();
      for (let k = 0; k < (this.stepUserModel._config.runNTimes ?? 1); k++) {
        if (this.stepUserModel._state !== State.RUNNING) {
          break;
        }
        await runScenario({ userId, userContext });
      }
    };
  }
}

export class UserJourneyRunForever implements UserJourney {
  stepUserModel: StepUserModel;

  constructor(stepUserModel: StepUserModel) {
    this.stepUserModel = stepUserModel;
  }

  /**
   * return User Journey async function
   */
  getUserJourney(
    spawnUser: () => Promise<{ userId: string; userContext: any }>,
    runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void>
  ): () => Promise<void> {
    return async () => {
      const { userId, userContext } = await spawnUser();
      while (this.stepUserModel._state === State.RUNNING) {
        await runScenario({ userId, userContext });
      }
    };
  }
}

export class UserJourneyRunOnce implements UserJourney {
  stepUserModel: StepUserModel;

  constructor(stepUserModel: StepUserModel) {
    this.stepUserModel = stepUserModel;
  }

  /**
   * return User Journey async function
   */
  getUserJourney(
    spawnUser: () => Promise<{ userId: string; userContext: any }>,
    runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void>
  ): () => Promise<void> {
    return async () => {
      const { userId, userContext } = await spawnUser();
      await runScenario({ userId, userContext });
    };
  }
}
