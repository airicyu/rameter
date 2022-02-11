import { Rameter, HttpRequestSampler, sleep, UserModelConfig } from "rameter";

const rameter = new Rameter();

/**
 * up-lifting
 */
await rameter.runStandalone();

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
      url: `http://localhost:8080/hello`, // replace this with ur endpoint
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sleep(100); // think time
  }
});

await rameter.readyTest(); // Get ready to test

/**
 * Start the load test. Run until test finished.
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
