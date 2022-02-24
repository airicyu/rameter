import type { SampleRecord } from "../../sharedTypes";
/**
 * Agent in worker node to forward the sample results to Master
 */
export interface SampleForwarder {
    forward(records: SampleRecord[]): Promise<any>;
    flush(): Promise<any>;
}
export declare type Config = {};
