import { WorkerNode, Config as WorkerNodeConfig } from "./workerNode/WorkerNode.js";
import { Config as MasterConfig, Master } from "./master/Master.js";
import { transformJmeterOut } from "./util/transformJmeterOut.js";

export class Rameter {
  master?: Master;
  workerNode?: WorkerNode;

  constructor() {}

  getWorkerNode() {
    return this.workerNode;
  }

  getMaster() {
    return this.master;
  }

  async runStandalone(config: MasterConfig & WorkerNodeConfig): Promise<{ master: Master; workerNode: WorkerNode }> {
    const master = await this.runMaster(config);
    const workerNode = await this.runWorkerNode(config);
    await master.waitNodesUp(1);

    this.master = master;
    this.workerNode = workerNode;
    return { master, workerNode };
  }

  async runMaster(config: MasterConfig): Promise<Master> {
    const master = new Master(config);
    await master.up();

    this.master = master;
    return master;
  }

  async runWorkerNode(config: WorkerNodeConfig) {
    const workerNode = new WorkerNode(config);
    await workerNode.up();

    this.workerNode = workerNode;
    return workerNode;
  }

  async exportGlobalContext(globalContext: any) {
    return this.master?.exportGlobalContext(globalContext);
  }

  async loadNodeContext(loadNodeContextHandler: (globalContext: any) => Promise<any>) {
    return this.workerNode?.loadNodeContext(loadNodeContextHandler);
  }

  async defineUserGroup(name: string, initUserContext: InitUserContextFunction) {
    return this.workerNode?.defineUserGroup(name, initUserContext);
  }

  async defineUserScenario(name: string, scenario: Scenario) {
    return this.workerNode?.defineUserScenario(name, scenario);
  }

  async readyTest() {
    return this.workerNode?.readyTest();
  }

  async broadcastRunTest(options: RunTestOptions[]) {
    return this.master?.broadcastRunTest(options);
  }

  async runUntilFinished(
    options: RunTestOptions[],
    {
      log,
      intermediateSummary,
      tickSummary,
      openDashboard,
    }: { log?: boolean; intermediateSummary?: boolean; tickSummary?: boolean; openDashboard?: boolean } = {}
  ) {
    await this.broadcastRunTest(options);
    await this.waitUntilFinished({
      log,
      intermediateSummary,
      tickSummary,
      openDashboard,
    });
  }

  async waitUntilFinished({
    log,
    intermediateSummary,
    tickSummary,
    openDashboard,
  }: { log?: boolean; intermediateSummary?: boolean; tickSummary?: boolean; openDashboard?: boolean } = {}) {
    return this.master?.waitUntilFinished({
      log,
      intermediateSummary,
      tickSummary,
      openDashboard,
    });
  }

  async down() {
    await this.master?.downNodes();
    await this.workerNode?.down();
    await this.master?.down();
  }

  async downNodes() {
    await this.master?.downNodes();
    await this.workerNode?.down();
  }

  async transformJmeterOut(inFile: string, outFile: string) {
    return transformJmeterOut(inFile, outFile);
  }
}
