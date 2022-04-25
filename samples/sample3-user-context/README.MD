# Sample 3: User Context

This sample is to demonstrate the usage of user context.

User Context is the context viables that you want to share within the virtual user scope. Each user would keep their own separated user context. It is up to you to set/get any variables to the user context.

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
cd samples/sample3-user-context
npm i
```

## Run Sample

```
cd samples/sample3-user-context
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
    users: [
        { id: 1, name: "John", token: "jwyTk" },
        { id: 2, name: "Mary", token: "lckgY" },
        { id: 3, name: "Sam", token: "w2fp#" },
        { id: 4, name: "Bryan", token: "q5a(p" },
    ],
});

......

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

......

/**
 * define user test scenario
 */
rameter.defineUserScenario("hello scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
    try {
        // call an HTTP endpoint
        await HttpRequestSampler.request({
        method: "GET",
        url: `${globalContext.serverBaseUrl}/hello?user=${userContext.user.name}`, // <--we use the user context variables
        });
    } catch (e) {
        console.error(e);
    } finally {
        await sleep(100); // think time
    }
});

......
```