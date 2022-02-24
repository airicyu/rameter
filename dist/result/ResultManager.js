import { FileResultStore } from "./store/FileResultStore.js";
import { DefaultResultAnalyzer } from "./analyzer/DefaultResultAnalyzer.js";
/**
 * Manage to store result, and perform result analysis.
 */
export class ResultManager {
    constructor(config, masterEvent) {
        this._config = config;
        this._masterEvent = masterEvent;
        this._resultStore = new FileResultStore(config.fileResultStore ?? {});
        this._resultAnalyzer = new DefaultResultAnalyzer({}, masterEvent);
    }
    async init() {
        await this._resultStore?.init();
        await this._resultAnalyzer?.init();
    }
    setResultStore(resultStore) {
        this._resultStore = resultStore;
    }
    setResultAnalyzer(resultAnalyzer) {
        this._resultAnalyzer = resultAnalyzer;
    }
    async store(records) {
        return this._resultStore?.store(records, false) ?? false;
    }
    async flushStore() {
        return this._resultStore?.flushStore() ?? false;
    }
    async analyzeIntermediateResult() {
        if (!this._resultAnalyzer) {
            throw new Error("No result analyzer!");
        }
        return this._resultAnalyzer.analyzeIntermediateResult();
    }
    async analyze() {
        if (!this._resultAnalyzer) {
            throw new Error("No result analyzer!");
        }
        return this._resultAnalyzer.analyze();
    }
    async tickAndAnalyzeFromLastTick() {
        if (!this._resultAnalyzer) {
            throw new Error("No result analyzer!");
        }
        return this._resultAnalyzer.tickAndAnalyzeFromLastTick();
    }
}
//# sourceMappingURL=ResultManager.js.map