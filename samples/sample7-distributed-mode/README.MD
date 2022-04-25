# Sample 7: Distributed Mode

We support distributed mode by commanding multiple distributed workde node to run the test.

**Master**: This is the centralized commander. It is also responsible to collect and analyze test results.

**Worker Node**: They would receiving command and run the scenarios.

Notice that, each worker node lifting up could only support run the load test once. 
If you want to run load test for the second time, you need to restart the worker node.
This constraint is due to the fact that Nodejs process cannot interrupt to cancel existing running promises.
To prevent any dirty running states, we decide that worker node need to restart if you want to run for the another time.

A better way to achieve that is to use pm2 to manage the worker node. So that we can quit worker node process and wait pm2 to restart it for next time usage.

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
cd samples/sample7-distributed-mode/master
npm i
cd ../workerNodee
npm i
```

## Run Master

```
cd samples/sample7-distributed-mode/master
npm start
```

## Run Worker Node

```
cd samples/sample7-distributed-mode/master
npm start
```
(alternatively you can run worker node with pm2 if you know how it works)

------

Sample code (Master):
```javascript
  const rameter = new Rameter();
  /**
   * up-lifting Master
   */
  await rameter.runMaster({ // <-- runMaster
    master: {
      host: "localhost",
      port: 3001,
    },
    numWorkerNodes: 1, // <--- remember to define this in distributed mode
    dashboard: {
      origin: "http://localhost:3000",
      port: 3000,
    },
  });

  /**
   * define global context
   */
  rameter.exportGlobalContext(......);

  /**
   * Trigger the load test
   */
  await rameter.runUntilFinished(......);

  /**
   * shutdown
   */
  await rameter.down();
  process.exit();
```


Sample code (WorkerNode):
```javascript
  const rameter = new Rameter();
  /**
   * up-lifting WorkerNode
   */
  await rameter.runWorkerNode({ // <-- runWorkerNode
    master: {
      host: "localhost",
      port: 3001,
    }
  });

  /**
   * define user groups
   */
  rameter.defineUserGroup("members");

  /**
   * define user test scenario
   */
  rameter.defineUserScenario("hello scenario", ......);

  await rameter.readyTest();
```