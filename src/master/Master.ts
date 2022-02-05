import { EventEmitter } from "events";
import { MasterIO } from "./MasterIO.js";
import { ResultManager } from "../result/ResultManager.js";
import { sleep } from "../util/sleep.js";
import { openUrl } from "../util/openUrl.js";
import { upDashboard } from "../util/dashboard.js";
import type { RunTestOptions, SampleRecord } from "../sharedTypes.js";

/**
 * Master Controller.
 *
 * Serve as controller. It fire commands to worker nodes to run the test. It collect result statistics.
 */
export class Master {
  _config;
  _globalContext: any;
  _eventEmitter: EventEmitter = new EventEmitter();

  _masterIO?: MasterIO;
  _resultManager?: ResultManager;

  _testStartTime?: number;
  _userCount = 0;
  _userGroupUserCount: { [key: string]: number } = {};

  _nodesReady = false;

  constructor(config: Config) {
    this._config = config;
  }

  setMasterIO(masterIO: MasterIO) {
    this._masterIO = masterIO;
  }

  async up() {
    if (!this._masterIO) {
      this._masterIO = new MasterIO(this._config);
    }

    if (!this._resultManager) {
      this._resultManager = new ResultManager(this._config, this._eventEmitter);
    }
    await this._resultManager.init();

    await this._attachIOChannel();
    await this._masterIO.up();
  }

  async waitNodesUp(n?: number) {
    if (n === undefined) {
      n = this._config.numWorkerNodes ?? 1;
    }
    return new Promise<void>((resolve) => {
      this._eventEmitter.emit("master:wait-nodes-init", n, () => {
        resolve();
      });
    });
  }

  async waitNodesReady(n?: number) {
    if (n === undefined) {
      n = this._config.numWorkerNodes ?? 1;
    }
    return new Promise<void>((resolve) => {
      this._eventEmitter.emit("master:wait-nodes-ready", n, () => {
        resolve();
      });
    });
  }

  getGlobalContext(): any {
    return this._globalContext;
  }

  async exportGlobalContext(globalContext: any) {
    await this.waitNodesUp();
    this._globalContext = globalContext;

    this._eventEmitter.emit("master:global-context.update", this._globalContext);
  }

  async broadcastRunTest(options: RunTestOptions[]) {
    await this.waitNodesReady();
    this._testStartTime = Date.now();
    this._eventEmitter.emit("master:command:run-test", options);
  }

  async broadcastStopTest() {
    this._eventEmitter.emit("master:command:stop-test");
  }

  async storeSampleRecords(sampleRecords: SampleRecord[]) {
    const allUsers = this._userCount;

    sampleRecords.forEach((record) => {
      record.testMeta.groupUsers = this._userGroupUserCount[record.testMeta.userGroup];
      record.testMeta.allUsers = allUsers;
    });

    await this._resultManager?.store(sampleRecords);
    this._eventEmitter.emit("master:sample-records:store", sampleRecords);
  }

  async tickAndAnalyzeFromLastTick() {
    return this._resultManager?.tickAndAnalyzeFromLastTick();
  }

  async analyzeIntermediateResult() {
    return this._resultManager?.analyzeIntermediateResult();
  }

  async analyzeResult() {
    return this._resultManager?.analyze();
  }

  updateUserCount(userCount: number) {
    this._userCount = userCount;
  }

  updateUserGroupUserCount(userGroupUserCount: { [key: string]: number }) {
    this._userGroupUserCount = userGroupUserCount;
  }

  async _afterTestFinished() {
    this._eventEmitter.emit("master:test-finished");
    await this._resultManager?.flushStore();
  }

  async down() {
    this._eventEmitter.emit("master:command:down");
    await sleep(100);
    process.exit(0);
  }

  async downNodes() {
    this._eventEmitter.emit("master:command:down-nodes");
  }

  get event() {
    return this._eventEmitter;
  }

  async _attachIOChannel() {
    this._masterIO?.attach(this);
  }

  async _waitUntilFinished() {
    return new Promise((resolve) => {
      this._eventEmitter.once("master:test-finished", resolve);
    });
  }

  async waitUntilFinished({
    log,
    intermediateSummary,
    tickSummary,
    openDashboard,
  }: { log?: boolean; intermediateSummary?: boolean; tickSummary?: boolean; openDashboard?: boolean } = {}) {
    let waiting = true;

    const tasks = [];

    tasks.push(this._waitUntilFinished().then(() => (waiting = false)));

    if (log !== false) {
      tasks.push(
        (async () => {
          while (waiting) {
            const { summary } = (await this.analyzeIntermediateResult()) ?? { summary: {} };

            let out = "";
            out += `[${new Date().toISOString()}] `;
            out += `run time: ${this._testStartTime ? Math.round((Date.now() - this._testStartTime) / 1000) : ""}s `;
            out += `users: ${this._userCount} `;
            out += `samples: ${Object.values(summary)
              .map((s) => s.count)
              .reduce((prev, curr) => prev + curr, 0)} `;
            out += `success: ${Object.values(summary)
              .map((s) => s.success)
              .reduce((prev, curr) => prev + curr, 0)} `;
            out += `fail: ${Object.values(summary)
              .map((s) => s.fail)
              .reduce((prev, curr) => prev + curr, 0)} `;

            console.log(out);
            await sleep(5000);
          }
          return;
        })()
      );
    }
    if (intermediateSummary !== false) {
      tasks.push(
        (async () => {
          while (waiting) {
            const intermediateSummary = await this.analyzeIntermediateResult();
            this._eventEmitter.emit("master:summary:intermediate", intermediateSummary);
            this._eventEmitter.emit("master:userGroupUserCount", { time: Date.now(), data: this._userGroupUserCount });
            await sleep(3000);
          }
          return;
        })()
      );
    }
    if (tickSummary !== false) {
      tasks.push(
        (async () => {
          while (waiting) {
            const tickSummary = await this.tickAndAnalyzeFromLastTick();
            this._eventEmitter.emit("master:summary:tick", tickSummary);
            await sleep(5000);
          }
          return;
        })()
      );
    }

    if (openDashboard !== false) {
      upDashboard(this._config.dashboard?.port ?? defaultConfig.dashboard.port);
      await sleep(1000);
      openUrl(this._config.dashboard?.origin ?? defaultConfig.dashboard.origin);
    }

    await Promise.race(tasks);
  }
}

const defaultConfig = {
  master: {
    host: "localhost",
    port: "3001",
  },
  numWorkerNodes: 1,
  dashboard: {
    origin: "http://localhost:3000",
    port: 3000,
  },
};

export type Config = {
  master?: {
    host?: string;
    port?: number;
    masterIO?: MasterIO;
  };
  numWorkerNodes?: number;
  dashboard?: {
    origin?: string;
    port?: number;
  };
  fileResultStore?: {
    batchRecordThershold?: 50;
    batchTimeThershold?: 1000;
    outFile?: string;
  };
  [key: string]: any;
};
