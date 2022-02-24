/**
 * Generic sampler.
 *
 * It is used for take sample for sth other than HTTP request.
 */
export declare class CustomSampler {
    _config: Config;
    constructor(config?: Config);
    run(code: () => Promise<any>): Promise<{
        data: any;
    }>;
}
export declare type Config = {};
