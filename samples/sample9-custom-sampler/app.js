import { Rameter, HttpRequestSampler, CustomSampler, sleep, UserModelConfig } from "rameter";

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
rameter.defineUserScenario("run custom operation scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
  try {
    // use CustomSampler to measure dummy operation
    const { data: result } = await CustomSampler.run(async () => {
      await sleep(500);
      const randomResult = Math.round(Math.random() * 100);
      return {
        data: { foo: randomResult },
        sampleRecord: {
          label: "Mocking some operation",
        },
      };
    });

    // randomly log the result
    if (result.foo > 95) {
      console.log(new Date().toISOString(), result.foo);
    }
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
    scenarios: ["run custom operation scenario"],
  },
]);

/**
 * shutdown
 */
await rameter.down();
process.exit();
