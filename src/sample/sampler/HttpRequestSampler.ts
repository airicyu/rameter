import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpRequestClient } from "../../http/HttpRequestClient.js";
import { Timer } from "../../util/timer.js";
import { SampleRecordFactory } from "../SampleRecordFactory.js";
import { getWorkerNode } from "../../util/singleton.js";
import { testMetaAsyncStorage } from "./../../workerNode/WorkerNode.js";

import http from "http";
import https from "https";
import timer from "@szmarczak/http-timer";

// http transport for timings
const httpTransport = {
  request: function httpWithTimer(...args: any[]) {
    const request = http.request.apply(null, args as any);
    timer(request);
    return request;
  },
};
// https transport for timings
const httpsTransport = {
  request: function httpWithTimer(...args: any[]) {
    const request = https.request.apply(null, args as any);
    timer(request);
    return request;
  },
};

export class HttpRequestSampler {
  _config: Config;

  constructor(config: Config = {}) {
    this._config = config;
  }

  static request(options: RequestOptions): Promise<AxiosResponse | null> {
    return new HttpRequestSampler().request(options);
  }

  async request(options: RequestOptions): Promise<AxiosResponse | null> {
    const { validateResponse } = options;
    let { label, ...requestOptions } = options;

    requestOptions = {
      ...this._config.defaultRequestOptions,
      ...requestOptions,
    };

    if (label === null || label === undefined) {
      label = `${options.method ?? "GET"} ${options.url?.replace(/(\?.*)/, "")?.replace(/https?:\/\/.*?(\/.*)/, "$1")}` ?? "http request";
    }

    // if user using our `validateResponse`, we just disable axios' `validateStatus`
    if (validateResponse) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      requestOptions.validateStatus = (status) => true;
    }

    const startTime = Date.now();

    const timer = new Timer().start();

    let response: AxiosResponse | null = null;
    let error = false;
    let errorInstance: any = null;

    // adding transport
    const isHttps = requestOptions.url?.startsWith("https");
    (requestOptions as any).transport = isHttps ? httpsTransport : httpTransport;

    try {
      response = await HttpRequestClient.instance.request(requestOptions);
    } catch (e: any) {
      error = true;
      errorInstance = e;
      response = e.response;
    }

    const durationMs = Math.round(timer.stop().duration);

    let success = !error;
    if (options.validateResponse && response) {
      success = options.validateResponse(response);
    }

    let statusText = response?.statusText ?? null;
    if (!success && statusText === null && errorInstance?.message !== undefined) {
      statusText = errorInstance?.message;
    }

    const timings = response?.request?.timings;
    const timeMeasures: { [key: string]: number | undefined } = {};
    if (timings) {
      timeMeasures.wait = timings?.phases?.wait;
      timeMeasures.connect = (timings?.secureConnect ?? timings?.connect) - timings.socket;
      timeMeasures.upload = timings?.phases.request;
      timeMeasures.firstByte = timings?.phases.firstByte;
      timeMeasures.download = timings?.phases.download;
    }

    const testMeta = testMetaAsyncStorage.getStore();

    if (testMeta) {
      const sampleRecord = SampleRecordFactory.from({
        label,
        startTime,
        success,
        durationMs,
        statusCode: response?.status !== undefined ? "" + response.status : null,
        statusText,
        wait: timeMeasures.wait ?? null,
        connect: timeMeasures.connect ?? null,
        upload: timeMeasures.upload ?? null,
        firstByte: timeMeasures.firstByte ?? null,
        download: timeMeasures.download ?? null,
        testMeta,
      });

      getWorkerNode()?.forwardSampleRecords([sampleRecord]);
    } else {
      console.error(new Error("Cannot get test meta!"));
    }

    return response;
  }
}

HttpRequestSampler;

export type Config = {
  defaultRequestOptions?: Partial<RequestOptions>;
};

export type CustomRequestOptions = {
  label?: string;
  validateResponse?: (response: AxiosResponse) => boolean;
};

export type RequestOptions = AxiosRequestConfig & CustomRequestOptions;
