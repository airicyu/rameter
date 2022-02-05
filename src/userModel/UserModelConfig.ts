import { UserRunMode, EndMode, Config as StepUserModelConfig } from "./StepUserModel.js";

/**
 * Util for creating user model config
 */
export class UserModelConfig {
  static stepUserLoopN({
    maxUsers,
    rampUpTime,
    steps,
    runNTimes,
    delayTime,
  }: {
    maxUsers: number;
    rampUpTime: number;
    steps: number;
    runNTimes?: number;
    delayTime?: number;
  }): StepUserModelConfig {
    return {
      maxUsers,
      rampUpTime,
      steps,
      holdTime: 0,
      delayTime,
      userRunMode: UserRunMode.RUN_N,
      runNTimes,
      endMode: EndMode.ALL_USER_DONE,
    };
  }

  static stepUserForTime({
    maxUsers,
    rampUpTime,
    steps,
    holdTime,
    delayTime,
  }: {
    maxUsers: number;
    rampUpTime: number;
    steps: number;
    holdTime: number;
    delayTime?: number;
  }): StepUserModelConfig {
    return {
      maxUsers,
      rampUpTime,
      steps,
      holdTime,
      delayTime,
      userRunMode: UserRunMode.RUN_FOREVER,
      endMode: EndMode.RUN_TIME,
    };
  }

  static userLoopN({ maxUsers, runNTimes, delayTime }: { maxUsers: number; runNTimes?: number; delayTime?: number }): StepUserModelConfig {
    return {
      maxUsers,
      rampUpTime: 0,
      steps: 1,
      holdTime: 0,
      delayTime,
      userRunMode: UserRunMode.RUN_N,
      runNTimes,
      endMode: EndMode.ALL_USER_DONE,
    };
  }

  static userLoopForTime({ maxUsers, holdTime, delayTime }: { maxUsers: number; holdTime: number; delayTime?: number }): StepUserModelConfig {
    return {
      maxUsers,
      rampUpTime: 0,
      steps: 1,
      holdTime,
      delayTime,
      userRunMode: UserRunMode.RUN_FOREVER,
      endMode: EndMode.RUN_TIME,
    };
  }
}
