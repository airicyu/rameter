import http from "http";
import * as io from "socket.io";
import { sleep } from "../util/sleep.js";
import { Master } from "./Master.js";

export class MasterIO {
  _config: Config;
  _httpServer?: http.Server;
  _io?: io.Server;

  _master?: Master;

  // _master?: Master;

  constructor(config: Config) {
    this._config = config;
  }

  attach(master: Master) {
    // this._master = master;
    this._master = master;
  }

  async up() {
    this._httpServer = http.createServer();
    this._io = new io.Server(this._httpServer, {
      cors: { origin: this._config.dashboard?.origin ?? defaultConfig.dashboard.origin },
    });

    this._io.of("/dashboard").on("connection", (socket: io.Socket) => {
      this._master?.event.on("master:summary:intermediate", (intermediateSummary) => {
        socket.emit("master:summary:intermediate", intermediateSummary);
      });
      this._master?.event.on("master:summary:tick", (tickSummary) => {
        socket.emit("master:summary:tick", tickSummary);
      });
      this._master?.event.on("master:userGroupUserCount", (userGroupUserCount) => {
        socket.emit("master:userGroupUserCount", userGroupUserCount);
      });
      this._master?.event.on("master:test-finished", () => {
        socket.emit("master:test-finished");
      });

      socket.on("dashboard:command:run-test", (options: RunTestOptions[]) => {
        this._master?.broadcastRunTest(options);
      });

      socket.on("dashboard:command:stop-test", () => {
        this._master?.broadcastStopTest();
      });

      socket.on("dashboard:command:down", () => {
        this._master?.down();
      });

      socket.on("dashboard:command:down-nodes", () => {
        this._master?.downNodes();
      });
    });

    // connect IO
    this._io.of("/workerNode").on("connection", (socket: SocketExtend) => {
      // client side driven events

      console.log("a client connected");

      socket.runTestState = RUN_TEST_STATE.INIT;

      // register worker node
      socket.once("worker-node:register-worker-node", (workerNodeId: string) => {
        socket.workerNodeId = workerNodeId;
        console.log(`worker node ${socket.workerNodeId} connected`);
        socket.emit("master:register-worker-node:ack");
      });

      // worker node disconnect
      socket.on("disconnect", () => {
        console.log(`work node ${socket.workerNodeId} disconnected`);
      });

      // global context request
      socket.on("worker-node:global-context:request", () => {
        // response with global context
        socket.emit("master:global-context:response", this._master?.getGlobalContext());
      });

      // receive sample records
      socket.on("worker-node:sample-records.push", (sampleRecords: SampleRecord[]) => {
        // forward
        this._master?.storeSampleRecords(sampleRecords);
      });

      // ack test start
      socket.on("worker-node:ready-test", () => {
        socket.runTestState = RUN_TEST_STATE.READY;
      });

      // ack test start
      socket.on("worker-node:test-started", () => {
        socket.runTestState = RUN_TEST_STATE.RUNNING;
      });

      // node run test finished
      socket.on("worker-node:test-finished", () => {
        socket.runTestState = RUN_TEST_STATE.FINISHED;
        if (this._io?.of("/workerNode")?.sockets) {
          let allFinished = true;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
            if ((socket as SocketExtend).runTestState === RUN_TEST_STATE.RUNNING) {
              allFinished = false;
              break;
            }
          }
          if (allFinished) {
            this._master?._afterTestFinished();
          }
        }
      });

      socket.on("worker-node:spawn-user", ({ user, group }) => {
        socket.userCount = user;
        socket.userGroupUserCount = group;

        if (this._io?.of("/workerNode")?.sockets) {
          let userCount = 0;
          const userGroupUserCount: { [key: string]: number } = {};
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
            userCount += (socket as SocketExtend).userCount ?? 0;
            if ((socket as SocketExtend).userGroupUserCount) {
              for (const [group, count] of Object.entries(
                (socket as SocketExtend).userGroupUserCount as {
                  [key: string]: number;
                }
              )) {
                userGroupUserCount[group] = userGroupUserCount[group] ?? 0;
                userGroupUserCount[group] += count;
              }
            }
          }

          this._master?.updateUserCount(userCount);
          this._master?.updateUserGroupUserCount(userGroupUserCount);
        }
      });

      socket.on("worker-node:finish-user", ({ user, group }) => {
        socket.userCount = user;
        socket.userGroupUserCount = group;

        if (this._io?.of("/workerNode")?.sockets) {
          let userCount = 0;
          const userGroupUserCount: { [key: string]: number } = {};
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
            userCount += (socket as SocketExtend).userCount ?? 0;
            if ((socket as SocketExtend).userGroupUserCount) {
              for (const [group, count] of Object.entries(
                (socket as SocketExtend).userGroupUserCount as {
                  [key: string]: number;
                }
              )) {
                userGroupUserCount[group] = userGroupUserCount[group] ?? 0;
                userGroupUserCount[group] += count;
              }
            }
          }

          this._master?.updateUserCount(userCount);
          this._master?.updateUserGroupUserCount(userGroupUserCount);
        }
      });
    });

    // wait for all nodes init and ready for receive commands
    this._master?.event.on("master:wait-nodes-init", async (n: number, done: () => void) => {
      for (;;) {
        if (this._io?.of("/workerNode")?.sockets) {
          let nodeCount = 0;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
            if ((socket as SocketExtend)?.runTestState === RUN_TEST_STATE.INIT) {
              nodeCount++;
            }
          }
          if (nodeCount === n) {
            break;
          }
        }
        await sleep(10);
      }
      done();
    });

    // wait for all nodes init and ready for start testing
    this._master?.event.on("master:wait-nodes-ready", async (n: number, done: () => void) => {
      for (;;) {
        if (this._io?.of("/workerNode")?.sockets) {
          let nodeCount = 0;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [_, socket] of this._io?.of("/workerNode")?.sockets ?? []) {
            if ((socket as SocketExtend)?.runTestState === RUN_TEST_STATE.READY) {
              nodeCount++;
            }
          }
          if (nodeCount === n) {
            break;
          }
        }
        await sleep(10);
      }
      done();
    });

    // Master updated globalContext
    this._master?.event.on("master:global-context.update", (globalContext) => {
      // broadcase snapshot
      this._io?.of("/workerNode")?.emit("master:global-context.update", globalContext);
    });

    // master trigger broadcast run test
    this._master?.event.on("master:command:run-test", (options: RunTestOptions[]) => {
      this._io?.of("/workerNode")?.emit("master:command:run-test", options);
    });

    // master trigger broadcast stop test
    this._master?.event.on("master:command:stop-test", () => {
      this._io?.of("/workerNode")?.emit("master:command:stop-test");
    });

    // master trigger shutdown nodes
    this._master?.event.on("master:command:down-nodes", async () => {
      this._io?.of("/workerNode")?.emit("master:command:down-nodes");
    });

    // master trigger shutdown
    this._master?.event.on("master:command:down", async () => {
      this._io?.of("/workerNode")?.emit("master:command:down");
      this.down();
    });

    return new Promise((resolve) => {
      this._httpServer?.listen(this._config.master?.port ?? defaultConfig.master.port, () => {
        resolve(true);
      });
    });
  }

  async down() {
    this._httpServer?.close((err) => {
      err && console.error(err);
      this._io?.close((err) => {
        err && console.error(err);
        console.log("master server closed");
      });
    });
  }
}

type SocketExtend = io.Socket & {
  workerNodeId?: string;
  runTestState?: RUN_TEST_STATE;
  userCount?: number;
  userGroupUserCount?: {
    [key: string]: number;
  };
};

const enum RUN_TEST_STATE {
  INIT = "INIT",
  READY = "READY",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
}

const defaultConfig = {
  master: {
    host: "localhost",
    port: "3001",
  },
  dashboard: {
    origin: "http://localhost:3000",
    port: 3000,
  },
};

export type Config = {
  master?: {
    port?: number;
  };
  dashboard?: {
    origin?: string;
  };
};
