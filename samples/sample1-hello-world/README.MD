# Sample1: Hello World

This sample is the simple hello world program.

-------

## Start Dummy Server

Before you start, run the dummy server to mock some HTTP endpoints
```
cd samples/dummyServer
npm start
```

## Install Sample

install command
```
cd samples/sample1-hello-world
npm i
```

## Run Sample

```
cd samples/sample1-hello-world
npm start
```

------

## Sample code: 
```javascript
import { Rameter, HttpRequestSampler, sleep, UserModelConfig } from "rameter";

const run = async () => {
  const rameter = new Rameter();
  /**
   * up-lifting Master and WorkerNode
   */
  await rameter.runStandalone({
    master: {
      host: "127.0.0.1",
      port: 3001,
    },
    numWorkerNodes: 1,
    workerNode: {
      id: "node1",
    },
    dashboard: {
      origin: "http://localhost:3000",
      port: 3000,
    },
  });

  /**
   * define global context
   */
  rameter.exportGlobalContext({});

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
        url: `http://localhost:8080/hello`,
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
};
run();
```