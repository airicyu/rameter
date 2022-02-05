import { ValueGetSet } from "../util/valueGetSet.js";
import { testMetaAsyncStorage } from "./WorkerNode.js";
import EventEmitter from "events";
import { StepUserModel } from "../userModel/StepUserModel.js";
import { Scenario } from "../scenario/Scenario.js";
import type { InitUserContextFunction, RunTestOptions, TestMeta } from "../sharedTypes.js";

/**
 * building the actual running processes for users X scenario, and run them til the end.
 */
export class TestRunner {
  static async runTest({
    globalContext,
    nodeContext,
    userCountGetSet,
    userGroupUserCountGetSet,
    userGroupMap,
    scenarioMap,
    options,
    workerNodeEvent,
  }: {
    globalContext: any;
    nodeContext: any;
    userCountGetSet: ValueGetSet<number>;
    userGroupUserCountGetSet: ValueGetSet<{ [key: string]: number }>;
    userGroupMap: { [key: string]: { initUserContext: InitUserContextFunction | null } };
    scenarioMap: { [key: string]: Scenario };
    options: RunTestOptions[];
    workerNodeEvent: EventEmitter;
  }) {
    const waitingRuns: Promise<void>[] = [];

    // loop RunTestOption
    for (const runTestOption of options) {
      const { userModel: userModelConfig, userGroups, scenarios } = runTestOption;

      // loop user group
      for (const userGroup of userGroups) {
        // loop scenario
        for (const scenario of scenarios) {
          // wrap with testMeta
          testMetaAsyncStorage.run(
            {
              userGroup: userGroup,
              scenario: scenario,
            },
            () => {
              const spawnUser: () => Promise<{ userId: string; userContext: any }> = TestRunner.buildSpawnUserFunction({
                globalContext,
                nodeContext,
                userGroup,
                userCountGetSet,
                userGroupUserCountGetSet,
                userGroupMap,
                workerNodeEvent,
              });

              const finishUser: () => void = TestRunner.buildFinishUserFunction({
                userGroup,
                workerNodeEvent,
                userCountGetSet,
                userGroupUserCountGetSet,
              });

              const runScenario: ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void> =
                TestRunner.buildRunScenarioFunction({ scenario, scenarioMap, globalContext, nodeContext });

              const userModel = new StepUserModel(userModelConfig);

              workerNodeEvent.on("worker-node:stop-test", () => {
                userModel.onTestStop();
              });

              waitingRuns.push(userModel.run({ spawnUser, runScenario, finishUser }));
            }
          );

          //
        }
      }
    }

    return await Promise.allSettled(waitingRuns);
  }

  static buildSpawnUserFunction({
    globalContext,
    nodeContext,
    userGroup,
    userCountGetSet,
    userGroupUserCountGetSet,
    userGroupMap,
    workerNodeEvent,
  }: {
    globalContext: any;
    nodeContext: any;
    userGroup: string;
    userCountGetSet: ValueGetSet<number>;
    userGroupUserCountGetSet: ValueGetSet<{ [key: string]: number }>;
    userGroupMap: { [key: string]: { initUserContext: InitUserContextFunction | null } };
    workerNodeEvent: EventEmitter;
  }): () => Promise<{ userId: string; userContext: any }> {
    const [getUserCount, setUserCount] = userCountGetSet;
    const [getUserGroupUserCount, setUserGroupUserCount] = userGroupUserCountGetSet;

    if (!userGroupMap[userGroup]) {
      throw new Error(`User group "${userGroup}" not defined!`);
    }

    return async () => {
      const userCount = (getUserCount() ?? 0) + 1;
      setUserCount(userCount);
      const userId = "" + userCount;

      const userContext = await (userGroupMap[userGroup].initUserContext?.({
        globalContext: globalContext,
        nodeContext: nodeContext,
        userId,
      }) ?? {});

      const userGroupUserCount = getUserGroupUserCount() ?? {};
      userGroupUserCount[userGroup] = userGroupUserCount[userGroup] ?? 0;
      userGroupUserCount[userGroup]++;
      setUserGroupUserCount(userGroupUserCount);

      workerNodeEvent.emit("worker-node:spawn-user", {
        user: getUserCount(),
        group: getUserGroupUserCount(),
      });

      return { userId, userContext };
    };
  }

  static buildFinishUserFunction({
    userGroup,
    workerNodeEvent,
    userCountGetSet,
    userGroupUserCountGetSet,
  }: {
    userGroup: string;
    workerNodeEvent: EventEmitter;
    userCountGetSet: ValueGetSet<number>;
    userGroupUserCountGetSet: ValueGetSet<{ [key: string]: number }>;
  }) {
    const [getUserCount, setUserCount] = userCountGetSet;
    const [getUserGroupUserCount, setUserGroupUserCount] = userGroupUserCountGetSet;

    return () => {
      const userCount = getUserCount();
      if (userCount) {
        setUserCount(userCount - 1);
      }
      const userGroupUserCountMap = getUserGroupUserCount();
      if (userGroupUserCountMap) {
        if (userGroupUserCountMap[userGroup] !== undefined) {
          userGroupUserCountMap[userGroup] -= 1;
          setUserGroupUserCount(userGroupUserCountMap);
        }
      }

      workerNodeEvent.emit("worker-node:finish-user", {
        user: getUserCount(),
        group: getUserGroupUserCount(),
      });
    };
  }

  static buildRunScenarioFunction({
    scenario,
    scenarioMap,
    globalContext,
    nodeContext,
  }: {
    scenario: string | string[];
    scenarioMap: { [key: string]: Scenario };
    globalContext: any;
    nodeContext: any;
  }): ({ userId, userContext }: { userId: string; userContext: any }) => Promise<void> {
    if (typeof scenario === "string") {
      if (!scenarioMap[scenario]) {
        throw new Error(`Scenario "${scenario}" not defined!`);
      }

      return async ({ userId, userContext }) => {
        try {
          const store: TestMeta | undefined = testMetaAsyncStorage.getStore();
          if (store) {
            store.userId = userId;
          }

          await scenarioMap[scenario]({
            globalContext: globalContext,
            nodeContext: nodeContext,
            userContext: userContext,
            userId,
          });
        } catch (e: any) {}
      };
    } else if (Array.isArray(scenario)) {
      scenario.forEach((it) => {
        if (!scenarioMap[it]) {
          throw new Error(`Scenario "${it}" not defined!`);
        }
      });

      return async ({ userId, userContext }) => {
        for (const oneScenario of scenario) {
          try {
            const store: TestMeta | undefined = testMetaAsyncStorage.getStore();
            if (store) {
              store.userId = userId;
            }

            await scenarioMap[oneScenario]({
              globalContext: globalContext,
              nodeContext: nodeContext,
              userContext: userContext,
              userId,
            });
          } catch (e: any) {}
        }
      };
    } else {
      throw new Error(`Invalid Scenario!`);
    }
  }
}
