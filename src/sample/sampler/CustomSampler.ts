import { Timer } from "../../util/timer.js";
import { SampleRecordFactory } from "../SampleRecordFactory.js";
import { testMetaAsyncStorage } from "../../workerNode/WorkerNode.js";
import { getWorkerNode } from "../../util/singleton.js";
import type { SampleRecord } from "../../sharedTypes.js";

/**
 * Generic sampler.
 *
 * It is used for take sample for sth other than HTTP request.
 */
export class CustomSampler {
  _config: Config;
  constructor(config: Config = {}) {
    this._config = config;
  }

  async run(code: () => Promise<any>) {
    const startTime = Date.now();
    const timer = new Timer().start();

    const { data, sampleRecord }: { data: any; sampleRecord: Partial<SampleRecord> } = await code();

    const durationMs = timer.stop().duration;

    const testMeta = testMetaAsyncStorage.getStore();

    const fullSampleRecord = SampleRecordFactory.from(
      Object.assign(
        {},
        {
          label: "sample",
          startTime,
          success: true,
          durationMs,
          statusCode: null,
          statusText: null,
        },
        sampleRecord,
        {
          testMeta: testMeta ?? {},
        }
      )
    );

    getWorkerNode()?.forwardSampleRecords([fullSampleRecord]);

    return { data };
  }
}

export type Config = {};
