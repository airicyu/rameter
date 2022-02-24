import { Timer } from "../../util/timer.js";
import { SampleRecordFactory } from "../SampleRecordFactory.js";
import { testMetaAsyncStorage } from "../../workerNode/WorkerNode.js";
import { getWorkerNode } from "../../util/singleton.js";
/**
 * Generic sampler.
 *
 * It is used for take sample for sth other than HTTP request.
 */
export class CustomSampler {
    constructor(config = {}) {
        this._config = config;
    }
    async run(code) {
        const startTime = Date.now();
        const timer = new Timer().start();
        const { data, sampleRecord } = await code();
        const durationMs = timer.stop().duration;
        const testMeta = testMetaAsyncStorage.getStore();
        const fullSampleRecord = SampleRecordFactory.from(Object.assign({}, {
            label: "sample",
            startTime,
            success: true,
            durationMs,
            statusCode: null,
            statusText: null,
        }, sampleRecord, {
            testMeta: testMeta ?? {},
        }));
        getWorkerNode()?.forwardSampleRecords([fullSampleRecord]);
        return { data };
    }
}
//# sourceMappingURL=CustomSampler.js.map