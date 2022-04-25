import type { AxiosRequestConfig, AxiosResponse } from "axios";
/**
 * Call HTTP request, and record the statistic.
 */
export declare class HttpRequestSampler {
    _config: Config;
    constructor(config?: Config);
    static default: HttpRequestSampler;
    static request(options: RequestOptions): Promise<AxiosResponse | null>;
    request(options: RequestOptions): Promise<AxiosResponse | null>;
}
export declare type Config = {
    defaultRequestOptions?: Partial<RequestOptions>;
};
export declare type CustomRequestOptions = {
    label?: string;
    validateResponse?: (response: AxiosResponse) => boolean;
};
export declare type RequestOptions = AxiosRequestConfig & CustomRequestOptions;
