/// <reference types="node" />
import { ValueGetSet } from "../util/valueGetSet.js";
import EventEmitter from "events";
import { Scenario } from "../scenario/Scenario.js";
import type { InitUserContextFunction, RunTestOptions } from "../sharedTypes.js";
/**
 * building the actual running processes for users X scenario, and run them til the end.
 */
export declare class TestRunner {
    static runTest({ globalContext, nodeContext, userCountGetSet, userGroupUserCountGetSet, userGroupMap, scenarioMap, options, workerNodeEvent, }: {
        globalContext: any;
        nodeContext: any;
        userCountGetSet: ValueGetSet<number>;
        userGroupUserCountGetSet: ValueGetSet<{
            [key: string]: number;
        }>;
        userGroupMap: {
            [key: string]: {
                initUserContext: InitUserContextFunction | null;
            };
        };
        scenarioMap: {
            [key: string]: Scenario;
        };
        options: RunTestOptions[];
        workerNodeEvent: EventEmitter;
    }): Promise<PromiseSettledResult<void>[]>;
    static buildSpawnUserFunction({ globalContext, nodeContext, userGroup, userCountGetSet, userGroupUserCountGetSet, userGroupMap, workerNodeEvent, }: {
        globalContext: any;
        nodeContext: any;
        userGroup: string;
        userCountGetSet: ValueGetSet<number>;
        userGroupUserCountGetSet: ValueGetSet<{
            [key: string]: number;
        }>;
        userGroupMap: {
            [key: string]: {
                initUserContext: InitUserContextFunction | null;
            };
        };
        workerNodeEvent: EventEmitter;
    }): () => Promise<{
        userId: string;
        userContext: any;
    }>;
    static buildFinishUserFunction({ userGroup, workerNodeEvent, userCountGetSet, userGroupUserCountGetSet, }: {
        userGroup: string;
        workerNodeEvent: EventEmitter;
        userCountGetSet: ValueGetSet<number>;
        userGroupUserCountGetSet: ValueGetSet<{
            [key: string]: number;
        }>;
    }): () => void;
    static buildRunScenarioFunction({ scenario, scenarioMap, globalContext, nodeContext, }: {
        scenario: string | string[];
        scenarioMap: {
            [key: string]: Scenario;
        };
        globalContext: any;
        nodeContext: any;
    }): ({ userId, userContext }: {
        userId: string;
        userContext: any;
    }) => Promise<void>;
}
