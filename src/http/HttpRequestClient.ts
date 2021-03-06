import axios from "axios";
import type { AxiosRequestConfig } from "axios";

/**
 * Wrapping the actual HTTP request client (Axios)
 */
export class HttpRequestClient {
  static _instance = axios.create({
    validateStatus: (status) => status < 300,
  });

  static get instance() {
    return HttpRequestClient._instance;
  }

  request(requestOptions: RequestOptions) {
    return HttpRequestClient._instance(requestOptions);
  }
}

export type RequestOptions = AxiosRequestConfig;
