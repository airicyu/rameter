import { WorkerNode } from "../workerNode/WorkerNode";
export const WORKER_NODE_HOLDER_KEY = Symbol.for("taponfire.global.workerNode");
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasWorkerNode = globalSymbols.indexOf(WORKER_NODE_HOLDER_KEY) > -1;
if (!hasWorkerNode) {
  (global as any)[WORKER_NODE_HOLDER_KEY] = {
    workerNode: null,
  };
}

export const registerWorkerNode = (workerNode: WorkerNode) => {
  (global as any)[WORKER_NODE_HOLDER_KEY].workerNode = workerNode;
};

export const getWorkerNode = (): WorkerNode | null => {
  return (global as any)[WORKER_NODE_HOLDER_KEY].workerNode;
};
