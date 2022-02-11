import { Rameter, HttpRequestSampler, sleep, UserModelConfig } from "rameter";
import { parse } from "csv-parse/sync";
import fs from "fs";

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
 * You can load very large files in here.
 * Each workerNode would run separately and set to local "nodeContext",
 * which later on can be used in userContext loading and scenario logic.
 */
rameter.loadNodeContext(async (globalContext) => {
  let largeCsv = parse(fs.readFileSync("./largeFile.csv", { encoding: "utf8" }), {
    columns: true,
    skip_empty_lines: true,
  });

  return {
    users: largeCsv,
  };
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
    //random select user from CSV
    const randomUser = nodeContext.users[Math.round(Math.random() * 10000000) % nodeContext.users.length];

    // call an HTTP endpoint
    await HttpRequestSampler.request({
      method: "GET",
      url: `${globalContext.serverBaseUrl}/hello?user=${randomUser.name}`, // <--get properties from global context
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sleep(100); // think time
  }
});

await rameter.readyTest();
