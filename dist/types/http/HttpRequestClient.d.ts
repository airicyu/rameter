import type { AxiosRequestConfig } from "axios";
/**
 * Wrapping the actual HTTP request client (Axios)
 */
export declare class HttpRequestClient {
    static _instance: import("axios").AxiosInstance;
    static get instance(): import("axios").AxiosInstance;
    request(requestOptions: RequestOptions): import("axios").AxiosPromise<any>;
}
export declare type RequestOptions = AxiosRequestConfig;
