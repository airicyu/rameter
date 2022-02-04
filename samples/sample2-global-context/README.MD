# Sample 2: Global Context

This sample is to demonstrate the usage of global context.

Global Context is the context viables that you want to share along the whole test scope. If you have some simple properties values that would be use, e.g. a global system token value, you may set it in global context so that it can be use later on.

In the test scenario, you can get the global context given from the function parameter. You should use this variable instead of reading some arbitrary global scope variables because they are not available in distributed mode.

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
cd samples/sample2-global-context
npm i
```

## Run Sample

```
cd samples/sample2-global-context
npm start
```

------

## Sample code: 
```javascript
const rameter = new Rameter();

......

/**
 * define global context
 */
rameter.exportGlobalContext({
    serverBaseUrl: "http://localhost:8080",
});

......

/**
 * define user test scenario
 */
rameter.defineUserScenario("hello scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
    try {
        // call an HTTP endpoint
        await HttpRequestSampler.request({
        method: "GET",
        url: `${globalContext.serverBaseUrl}/hello`, //<--get properties from global context
        });
    } catch (e) {
        console.error(e);
    } finally {
        await sleep(100);
    }
});

```