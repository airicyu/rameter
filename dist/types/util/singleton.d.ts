import { WorkerNode } from "../workerNode/WorkerNode";
/**
 * This file is utils for register a single reference for worker node in local.
 */
export declare const WORKER_NODE_HOLDER_KEY: unique symbol;
export declare const registerWorkerNode: (workerNode: WorkerNode) => void;
export declare const getWorkerNode: () => WorkerNode | null;
