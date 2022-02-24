/**
 * The Scenario function to run
 */
export declare type Scenario = (parameters: {
    globalContext: any;
    nodeContext: any;
    userContext: any;
    userId: string;
}) => Promise<void>;
