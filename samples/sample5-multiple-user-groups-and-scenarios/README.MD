# Sample 5: Multiple User Groups and Scenarios

This sample is to demonstrate more complex way to run multiple user groups with multiple scenarios.

You can specify multiple `RunTestOptions` when trigger load test so that you can define multiple user groups in each setup. In each `RunTestOptions`, you may specify to run scenarios parallelly like this:

scenarios: ["A", "B", "C"]

or, you may specify to run scenarios to run in sequential order by wrapping an array value like this:

scenarios: [["A1", "A2", "A3"]]

or combine them:

scenarios: [["A1", "A2", "A3"], "B", "C"]

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
cd samples/sample5-multiple-user-groups-and-scenarios
npm i
```

## Run Sample

```
cd samples/sample5-multiple-user-groups-and-scenarios
npm start
```

------

## Sample code: 
```javascript

const rameter = new Rameter();

......

/**
 * We define two user groups
 */
rameter.defineUserGroup("members", ...... )

rameter.defineUserGroup("anonymous users");

/**
 * We define two scenarios
 */
rameter.defineUserScenario("hello scenario", ......)

rameter.defineUserScenario("foo scenario", ......)

......

  /**
   * Trigger the load test
   */
  await rameter.runUntilFinished([
    /**
     * The first config:
     * with user group "members",
     * each user would run "hello scenario" and then "foo scenario" in each iteration
     */
    {
      userModel: UserModelConfig.stepUserForTime({
        maxUsers: 20,
        steps: 10,
        rampUpTime: 15,
        holdTime: 30,
      }),
      userGroups: ["members"],
      scenarios: [["hello scenario", "foo scenario"]],
    },
    /**
     * The second config:
     * with user group "anonymous users",
     * each user would run "foo scenario"
     */
    {
      userModel: UserModelConfig.stepUserForTime({
        maxUsers: 50,
        steps: 10,
        delayTime: 10,
        rampUpTime: 10,
        holdTime: 30,
      }),
      userGroups: ["anonymous users"],
      scenarios: ["foo scenario"], // define to run these two scenarios
    },
  ]);

```