import { Rameter, UserModelConfig } from "rameter";

const rameter = new Rameter();
/**
 * up-lifting Master
 */
await rameter.runMaster({
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
rameter.exportGlobalContext({
  serverBaseUrl: "http://localhost:8080",
});

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
process.exit();
