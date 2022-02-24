import { StepUserModel } from "./StepUserModel.js";
/**
 * The common interface for different ways to run user journey:
 * - run once
 * - run N times
 * - run forever
 */
export interface UserJourney {
    getUserJourney(spawnUser: () => Promise<{
        userId: string;
        userContext: any;
    }>, runScenario: ({ userId, userContext }: {
        userId: string;
        userContext: any;
    }) => Promise<void>): () => Promise<void>;
}
export declare class UserJourneyRunN implements UserJourney {
    stepUserModel: StepUserModel;
    constructor(stepUserModel: StepUserModel);
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser: () => Promise<{
        userId: string;
        userContext: any;
    }>, runScenario: ({ userId, userContext }: {
        userId: string;
        userContext: any;
    }) => Promise<void>): () => Promise<void>;
}
export declare class UserJourneyRunForever implements UserJourney {
    stepUserModel: StepUserModel;
    constructor(stepUserModel: StepUserModel);
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser: () => Promise<{
        userId: string;
        userContext: any;
    }>, runScenario: ({ userId, userContext }: {
        userId: string;
        userContext: any;
    }) => Promise<void>): () => Promise<void>;
}
export declare class UserJourneyRunOnce implements UserJourney {
    stepUserModel: StepUserModel;
    constructor(stepUserModel: StepUserModel);
    /**
     * return User Journey async function
     */
    getUserJourney(spawnUser: () => Promise<{
        userId: string;
        userContext: any;
    }>, runScenario: ({ userId, userContext }: {
        userId: string;
        userContext: any;
    }) => Promise<void>): () => Promise<void>;
}
