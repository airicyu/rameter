/**
 * This file is utils for register a single reference for worker node in local.
 */
export const WORKER_NODE_HOLDER_KEY = Symbol.for("taponfire.global.workerNode");
const globalSymbols = Object.getOwnPropertySymbols(global);
const hasWorkerNode = globalSymbols.indexOf(WORKER_NODE_HOLDER_KEY) > -1;
if (!hasWorkerNode) {
    global[WORKER_NODE_HOLDER_KEY] = {
        workerNode: null,
    };
}
export const registerWorkerNode = (workerNode) => {
    global[WORKER_NODE_HOLDER_KEY].workerNode = workerNode;
};
export const getWorkerNode = () => {
    return global[WORKER_NODE_HOLDER_KEY].workerNode;
};
//# sourceMappingURL=singleton.js.map