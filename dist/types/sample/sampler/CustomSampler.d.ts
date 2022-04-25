import type { SampleRecord } from "../../sharedTypes.js";
/**
 * Generic sampler.
 *
 * It is used for take sample for sth other than HTTP request.
 */
export declare class CustomSampler {
    _config: Config;
    constructor(config?: Config);
    static default: CustomSampler;
    static run(code: () => Promise<{
        data: any;
        sampleRecord: Partial<SampleRecord>;
    }>): Promise<{
        data: any;
    }>;
    run(code: () => Promise<{
        data: any;
        sampleRecord: Partial<SampleRecord>;
    }>): Promise<{
        data: any;
    }>;
}
export declare type Config = {};
