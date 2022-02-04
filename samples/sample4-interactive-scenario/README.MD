# Sample 4: Interactive Scenario

This sample is to demonstrate that you can read the API response from HTTP endpoint, and write your dynamic scenario logic.

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
cd samples/sample4-interactive-scenario
npm i
```

## Run Sample

```
cd samples/sample4-interactive-scenario
npm start
```

------

## Sample code: 
```javascript

const rameter = new Rameter();

......

rameter.defineUserScenario("verify code scenario", async ({ globalContext, nodeContext, userContext, userId }) => {
    try {
        // call API 1
        const codeResponse = await HttpRequestSampler.request({
        label: "generateCode",
        method: "GET",
        url: `${serverBaseUrl}/generateCode?user=${userContext.user.name}&token=${userContext.user.token}`,
        });

        /**
         * Read API response data from API 1
         */
        const { code } = codeResponse?.data ?? "";

        // call API 2, with the code we get from API 1
        await HttpRequestSampler.request({
        label: "verifyCode",
        method: "GET",
        url: `${serverBaseUrl}/verifyCode?user=${userContext.user.name}&code=${code}`,
        validateResponse: (response) => {
            return response.data.success;
        },
        });
    } catch (e) {
        console.error(e);
    } finally {
        await sleep(100); //think time
    }
});

```