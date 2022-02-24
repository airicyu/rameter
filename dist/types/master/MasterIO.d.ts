/// <reference types="node" />
import http from "http";
import * as io from "socket.io";
import { Master } from "./Master.js";
/**
 * Responsible to handle external IO for Master
 */
export declare class MasterIO {
    _config: Config;
    _httpServer?: http.Server;
    _io?: io.Server;
    _master?: Master;
    constructor(config: Config);
    attach(master: Master): void;
    up(): Promise<unknown>;
    down(): Promise<void>;
}
export declare type Config = {
    master?: {
        port?: number;
    };
    dashboard?: {
        origin?: string;
    };
};
