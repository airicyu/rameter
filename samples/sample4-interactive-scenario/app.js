import { Rameter, HttpRequestSampler, sleep, UserModelConfig } from "rameter";

const run = async () => {
  const rameter = new Rameter();
  /**
   * up-lifting Master and WorkerNode
   */
  await rameter.runStandalone({
    master: {
      host: "localhost",
      port: 3001,
    },
    dashboard: {
      origin: "http://localhost:3000",
      port: 3000,
    },
  });

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
      scenarios: ["verify code scenario"],
    },
  ]);

  /**
   * shutdown
   */
  await rameter.down();
};
run();
