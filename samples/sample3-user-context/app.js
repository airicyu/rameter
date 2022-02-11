import { Rameter, HttpRequestSampler, sleep, UserModelConfig } from "rameter";

const rameter = new Rameter();
/**
 * up-lifting Master and WorkerNode
 */
await rameter.runStandalone({
  master: {
    host: "localhost",
    port: 3001,
  },
  dashboard: {
    origin: "http://localhost:3000",
    port: 3000,
  },
});

/**
 * define global context
 */
rameter.exportGlobalContext({
  serverBaseUrl: "http://localhost:8080",
  users: [
    { id: 1, name: "John", token: "jwyTk" },
    { id: 2, name: "Mary", token: "lckgY" },
    { id: 3, name: "Sam", token: "w2fp#" },
    { id: 4, name: "Bryan", token: "q5a(p" },
  ],
});

/**
 * define user groups,
 * and the function to initialize user context
 */
rameter.defineUserGroup("members", async ({ globalContext, nodeContext, userId }) => {
  // random select user from user list
  return {
    user: globalContext.users[+userId % globalContext.users.length],
  };
});

/**
 * define user test scenario
 */
rameter.defineUserScenario("hello scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
  try {
    // call an HTTP endpoint
    await HttpRequestSampler.request({
      method: "GET",
      url: `${globalContext.serverBaseUrl}/hello?user=${userContext.user.name}`, // <--we use the user context variables
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sleep(100); // think time
  }
});

await rameter.readyTest();

/**
 * Trigger the load test
 */
await rameter.runUntilFinished([
  {
    userModel: UserModelConfig.stepUserForTime({
      maxUsers: 20,
      steps: 10,
      rampUpTime: 10,
      holdTime: 20,
    }),
    userGroups: ["members"],
    scenarios: ["hello scenario"],
  },
]);

/**
 * shutdown
 */
await rameter.down();
