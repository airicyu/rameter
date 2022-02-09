import { WorkerNode, Config as WorkerNodeConfig } from "./workerNode/WorkerNode.js";
import { Config as MasterConfig, Master } from "./master/Master.js";
import { transformJmeterOut } from "./util/transformJmeterOut.js";
import type { Scenario } from "./scenario/Scenario.js";
import type { InitUserContextFunction, RunTestOptions } from "./sharedTypes.js";

/**
 * This is the major class to use to control the test.
 */
export class Rameter {
  _master?: Master;
  _workerNode?: WorkerNode;

  constructor() {}

  /**
   * Get internal WorkerNode instance
   * @returns WorkerNode
   */
  getWorkerNode() {
    return this._workerNode;
  }

  /**
   * Get internal Master instance
   * @returns Master
   */
  getMaster() {
    return this._master;
  }

  /**
   * Run the setup for standalone mode.
   * It would create a Master & a local Workder Node
   *
   * @param config
   * @returns
   */
  async runStandalone(config: MasterConfig & WorkerNodeConfig): Promise<{ master: Master; workerNode: WorkerNode }> {
    const master = await this.runMaster(config);
    const workerNode = await this.runWorkerNode(config);
    await master.waitNodesUp(1);

    this._master = master;
    this._workerNode = workerNode;
    return { master, workerNode };
  }

  /**
   * Run the setup for distribute mode - Run the Master
   *
   * @param config
   * @returns
   */
  async runMaster(config: MasterConfig): Promise<Master> {
    const master = new Master(config);
    await master.up();

    this._master = master;
    return master;
  }

  /**
   * Run the setup for distribute mode - Run the Worker Node
   *
   * @param config
   * @returns
   */
  async runWorkerNode(config: WorkerNodeConfig) {
    const workerNode = new WorkerNode(config);
    await workerNode.up();

    this._workerNode = workerNode;
    return workerNode;
  }

  /**
   * Export the globalContext. It would broadcase to all connecting Workder Node
   *
   * @param globalContext
   */
  async exportGlobalContext(globalContext: any) {
    return await this._master?.exportGlobalContext(globalContext);
  }

  /**
   * Set the handler for loading Node Context.
   *
   * @param loadNodeContextHandler
   */
  async loadNodeContext(loadNodeContextHandler: (globalContext: any) => Promise<any>) {
    return await this._workerNode?.loadNodeContext(loadNodeContextHandler);
  }

  /**
   * Define User Group.
   *
   * @param name
   * @param initUserContext
   */
  async defineUserGroup(name: string, initUserContext: InitUserContextFunction) {
    return this._workerNode?.defineUserGroup(name, initUserContext);
  }

  /**
   * Define User Scenario.
   *
   * @param name
   * @param scenario
   */
  async defineUserScenario(name: string, scenario: Scenario) {
    return this._workerNode?.defineUserScenario(name, scenario);
  }

  /**
   * Mark for Work Node ready for start testing.
   *
   * @returns
   */
  async readyTest() {
    return this._workerNode?.readyTest();
  }

  /**
   * Start running the test.
   *
   * (It must be run after readyTest() is called.)
   *
   * @param options
   * @returns
   */
  async broadcastRunTest(options: RunTestOptions[]) {
    return this._master?.broadcastRunTest(options);
  }

  /**
   * Wait until test finished.
   *
   * @param param0
   * @returns
   */
  async waitUntilFinished({ log, openDashboard }: { log?: boolean; openDashboard?: boolean } = {}) {
    return this._master?.waitUntilFinished({
      log,
      openDashboard,
    });
  }

  /**
   * Start running the test, and wait until test finished
   *
   * @param options
   * @param param1
   */
  async runUntilFinished(options: RunTestOptions[], { log, openDashboard }: { log?: boolean; openDashboard?: boolean } = {}) {
    await this.broadcastRunTest(options);
    await this.waitUntilFinished({
      log,
      openDashboard,
    });
  }

  /**
   * Try bring down the Workder Nodes and then the Master
   */
  async down() {
    await this._master?.downNodes();
    await this._workerNode?.down();
    await this._master?.down();
  }

  /**
   * Try bring down the Workder Nodes.
   */
  async downNodes() {
    await this._master?.downNodes();
    await this._workerNode?.down();
  }

  /**
   * Transform output file to Jmeter CSV format
   * @param inFile
   * @param outFile
   */
  async transformJmeterOut(inFile: string, outFile: string) {
    await transformJmeterOut(inFile, outFile);
  }
}
