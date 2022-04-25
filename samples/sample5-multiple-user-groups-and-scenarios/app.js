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
 * define another user groups
 */
rameter.defineUserGroup("anonymous users");

/**
 * define user test scenario "hello scenario"
 */
rameter.defineUserScenario("hello scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
  try {
    // call an HTTP endpoint
    await HttpRequestSampler.request({
      method: "GET",
      url: `${globalContext.serverBaseUrl}/hello?user=${userContext.user.name}`,
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sleep(100); // think time
  }
});

/**
 * We define another test scenario "foo scenario"
 */
rameter.defineUserScenario("foo scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
  try {
    // call API 1
    await HttpRequestSampler.request({
      method: "GET",
      url: `${globalContext.serverBaseUrl}/foo`,
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sleep(100); //think time
  }
});

await rameter.readyTest();

/**
 * Trigger the load test
 */
await rameter.runUntilFinished([
  /**
   * The first config:
   * with user group "members",
   * each user would run "hello scenario" and then "foo scenario" in each iteration
   */
  {
    userModel: UserModelConfig.stepUserForTime({
      maxUsers: 20,
      steps: 10,
      rampUpTime: 15,
      holdTime: 30,
    }),
    userGroups: ["members"],
    scenarios: [["hello scenario", "foo scenario"]],
  },
  /**
   * The second config:
   * with user group "anonymous users",
   * each user would run "foo scenario"
   */
  {
    userModel: UserModelConfig.stepUserForTime({
      maxUsers: 50,
      steps: 10,
      delayTime: 10,
      rampUpTime: 10,
      holdTime: 30,
    }),
    userGroups: ["anonymous users"],
    scenarios: ["foo scenario"], // define to run these two scenarios
  },
]);

/**
 * shutdown
 */
await rameter.down();
process.exit();
