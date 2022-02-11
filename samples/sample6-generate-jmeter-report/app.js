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
});

/**
 * define user groups
 */
rameter.defineUserGroup("members");

/**
 * define user test scenario
 */
rameter.defineUserScenario("hello scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
  try {
    // call an HTTP endpoint
    await HttpRequestSampler.request({
      method: "GET",
      url: `${globalContext.serverBaseUrl}/hello`, // <--get properties from global context
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

/**
 * write jmeter format output
 */
await rameter.transformJmeterOut("./result.csv", "./result_jmeter.csv");
