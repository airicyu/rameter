import { WorkerNode } from "../../workerNode/WorkerNode.js";
import type { SampleForwarder, Config as BaseConfig } from "./SampleForwarder.js";
import * as ioClient from "socket.io-client";
import { EventEmitter } from "events";
import { DeferTrigger } from "../../util/DeferTrigger.js";
import type { SampleRecord } from "../../sharedTypes.js";

/**
 * Default implementation of SampleForwarder.
 *
 * It would send back sample result to Master via websocket.
 * It has some kind of internal buffering to flush send when "every N samples buffered or T seconds passed".
 */
export class DefaultSampleForwarder implements SampleForwarder {
  _config: Config;
  _socket?: ioClient.Socket;

  defaultConfig = {
    batchRecordThershold: 100,
    batchTimeThershold: 5000,
  };

  _event = new EventEmitter();

  _bufferRecords: SampleRecord[] = [];
  _lastForwardTime = 0;

  _state: State = State.IDLE;

  _deferTrigger?: DeferTrigger;

  constructor(config: Config, workerNode: WorkerNode) {
    this._config = config ?? {};

    workerNode.event.on("worker-node:up", () => {
      this._socket = workerNode.getIOChannelSocket();
    });

    workerNode.event.on("worker-node:shutdown", this.down);

    this._deferTrigger = new DeferTrigger();
  }

  async forward(records: SampleRecord[], forceFlush = false): Promise<any> {
    if (records.length > 0) {
      this._bufferRecords.push(...records);
    }

    if (this._state === State.IDLE) {
      if (forceFlush || Date.now() - this._lastForwardTime >= this.batchTimeThershold || this._bufferRecords.length >= this.batchRecordThershold) {
        this._state = State.FORWARDING; // locking and prevent mutual writing

        this._deferTrigger?.cancelTrigger();
        await this.forwardBufferToMaster();

        this._state = State.IDLE; // release lock

        this._event.emit("idle");
      } else {
        // just not yet time to forward... pls wait
      }
    } else if (this._state === State.FORWARDING) {
      // busying... keep waiting
    }

    // waiting to forward
    if (this._bufferRecords.length > 0) {
      this._deferTrigger?.deferTriggerOnce(async () => {
        await this.flush();
      }, this._config.batchTimeThershold ?? 5000);
    }
    return true;
  }

  /**
   * trigger flush of buffer,
   * if it is busying, then would wait to flush.
   */
  async flush() {
    if (this._state === State.IDLE) {
      await this.forward([], true);
      return true;
    } else {
      //forward
      return new Promise<boolean>((resolve) => {
        this._event.once("idle", async () => {
          if (this._state === State.IDLE) {
            await this.forward([], true);
            resolve(true);
          } else {
            //somehow others triggered the flush, we dun need to duplicate run
            resolve(false);
          }
        });
      });
    }
  }

  /**
   * underlining function to physically forward buffered records
   */
  async forwardBufferToMaster() {
    // swap buffer first, prevent mutual pushing new records to buffer while writing
    const buffer = this._bufferRecords;
    this._bufferRecords = [];
    this._lastForwardTime = Date.now();

    if (buffer.length > 0) {
      this._socket?.emit("worker-node:sample-records.push", buffer);
    }
    return;
  }

  get batchRecordThershold() {
    return this._config.batchRecordThershold ?? this.defaultConfig.batchRecordThershold;
  }

  get batchTimeThershold() {
    return this._config.batchTimeThershold ?? this.defaultConfig.batchTimeThershold;
  }

  down() {}
}

export type Config = {
  batchRecordThershold?: number;
  batchTimeThershold?: number;
} & BaseConfig;

const enum State {
  IDLE = "IDLE",
  FORWARDING = "FORWARDING",
}
