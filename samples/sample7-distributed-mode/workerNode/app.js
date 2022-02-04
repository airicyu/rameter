import { Rameter, HttpRequestSampler, sleep } from "rameter";

const run = async () => {
  const rameter = new Rameter();
  /**
   * up-lifting WorkerNode
   */
  await rameter.runWorkerNode({
    master: {
      host: "localhost",
      port: 3001,
    },
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
};
run();
