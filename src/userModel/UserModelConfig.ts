import { UserRunMode, EndMode, Config as StepUserModelConfig } from "./StepUserModel.js";

export class UserModelConfig {
  static stepUserLoopN({
    maxUsers,
    steps,
    rampUpTime,
    runNTimes,
    delayTime,
  }: {
    maxUsers: number;
    steps: number;
    rampUpTime: number;
    runNTimes?: number;
    delayTime?: number;
  }): StepUserModelConfig {
    return {
      maxUsers,
      steps,
      rampUpTime,
      holdTime: 0,
      delayTime,
      userRunMode: UserRunMode.RUN_N,
      runNTimes,
      endMode: EndMode.ALL_USER_DONE,
    };
  }

  static stepUserForTime({
    maxUsers,
    steps,
    rampUpTime,
    holdTime,
    delayTime,
  }: {
    maxUsers: number;
    steps: number;
    rampUpTime: number;
    holdTime: number;
    delayTime?: number;
  }): StepUserModelConfig {
    return {
      maxUsers,
      steps,
      rampUpTime,
      holdTime,
      delayTime,
      userRunMode: UserRunMode.RUN_FOREVER,
      endMode: EndMode.RUN_TIME,
    };
  }

  static userLoopN({ maxUsers, runNTimes, delayTime }: { maxUsers: number; runNTimes: number; delayTime?: number }): StepUserModelConfig {
    return {
      maxUsers,
      steps: 1,
      rampUpTime: 0,
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
      steps: 1,
      rampUpTime: 0,
      holdTime,
      delayTime,
      userRunMode: UserRunMode.RUN_FOREVER,
      endMode: EndMode.RUN_TIME,
    };
  }
}
