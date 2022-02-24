import { WorkerNode, Config as WorkerNodeConfig } from "./workerNode/WorkerNode.js";
import { Config as MasterConfig, Master } from "./master/Master.js";
import type { Scenario } from "./scenario/Scenario.js";
import type { InitUserContextFunction, RunTestOptions } from "./sharedTypes.js";
/**
 * This is the major class to use to control the test.
 */
export declare class Rameter {
    _master?: Master;
    _workerNode?: WorkerNode;
    constructor();
    /**
     * Get internal WorkerNode instance
     * @returns WorkerNode
     */
    getWorkerNode(): WorkerNode | undefined;
    /**
     * Get internal Master instance
     * @returns Master
     */
    getMaster(): Master | undefined;
    /**
     * Run the setup for standalone mode.
     * It would create a Master & a local Workder Node
     *
     * @param config
     * @returns
     */
    runStandalone(config: MasterConfig & WorkerNodeConfig): Promise<{
        master: Master;
        workerNode: WorkerNode;
    }>;
    /**
     * Run the setup for distribute mode - Run the Master
     *
     * @param config
     * @returns
     */
    runMaster(config?: MasterConfig): Promise<Master>;
    /**
     * Run the setup for distribute mode - Run the Worker Node
     *
     * @param config
     * @returns
     */
    runWorkerNode(config?: WorkerNodeConfig): Promise<WorkerNode>;
    /**
     * Export the globalContext. It would broadcase to all connecting Workder Node
     *
     * @param globalContext
     */
    exportGlobalContext(globalContext: any): Promise<void | undefined>;
    /**
     * Set the handler for loading Node Context.
     *
     * @param loadNodeContextHandler
     */
    loadNodeContext(loadNodeContextHandler: (globalContext: any) => Promise<any>): Promise<void | undefined>;
    /**
     * Define User Group.
     *
     * @param name
     * @param initUserContext
     */
    defineUserGroup(name: string, initUserContext: InitUserContextFunction): Promise<void | undefined>;
    /**
     * Define User Scenario.
     *
     * @param name
     * @param scenario
     */
    defineUserScenario(name: string, scenario: Scenario): Promise<void | undefined>;
    /**
     * Mark for Work Node ready for start testing.
     *
     * @returns
     */
    readyTest(): Promise<void | undefined>;
    /**
     * Start running the test.
     *
     * (It must be run after readyTest() is called.)
     *
     * @param options
     * @returns
     */
    broadcastRunTest(options: RunTestOptions[]): Promise<void | undefined>;
    /**
     * Wait until test finished.
     *
     * @param param0
     * @returns
     */
    waitUntilFinished({ log, openDashboard }?: {
        log?: boolean;
        openDashboard?: boolean;
    }): Promise<void | undefined>;
    /**
     * Start running the test, and wait until test finished
     *
     * @param options
     * @param param1
     */
    runUntilFinished(options: RunTestOptions[], { log, openDashboard }?: {
        log?: boolean;
        openDashboard?: boolean;
    }): Promise<void>;
    /**
     * Try bring down the Workder Nodes and then the Master
     */
    down(): Promise<void>;
    /**
     * Try bring down the Workder Nodes.
     */
    downNodes(): Promise<void>;
    /**
     * Transform output file to Jmeter CSV format
     * @param inFile
     * @param outFile
     */
    transformJmeterOut(inFile: string, outFile: string): Promise<void>;
}
