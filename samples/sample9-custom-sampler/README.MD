# Sample9: Custom Sampler

Previous samples shown are all using HTTP sampler which you verify performance of HTTP request call.
But what if you want to verify operation performance which is not HTTP request call?
For examples, loading DB operation? Schedule job processing time?

Actually Rameter provide you the `CustomSampler` which you can run any code fragment as an operation.
And Rameter can measure the operation performance just like how you can meqsure the HTTP requests.

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
cd samples/sample9-custom-sampler
npm i
```

## Run Sample

```
cd samples/sample9-custom-sampler
npm start
```

------

## Sample code: 
```javascript
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
```

Notice that:
- You can call `CustomSampler.run` to trigger, and pass the running code to the parameter.
- The code fragment function return `{ data: XXX, sampleRecord: YYY }`. 
  - `XXX` is any data you want to return to your scenario code.
  - `YYY` is sampler metatdata. It is totally optional but it is recommended that you set the "label" attribute to group operation performance sample result.