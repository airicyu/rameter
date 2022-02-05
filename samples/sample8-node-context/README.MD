# Sample 8: Node Context

If you have very large files need to load to share between users, it is not efficient to share such large file via globalContext.

For distributed mode, we allow each nodes to run some code locally to load local resource (e.g: load very big file from file system).
This is the node context. And the node context variable is available to use in user context initialization and scenario function.

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
cd samples/sample8-node-context/master
npm i
cd ../workerNodee
npm i
```

## Run Master

```
cd samples/sample8-node-context/master
npm start
```

## Run Worker Node

```
cd samples/sample8-node-context/master
npm start
```
(alternatively you can run worker node with pm2 if you know how it works)

------

Sample code (WorkerNode):
```javascript
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

  ......

  await rameter.readyTest();


```