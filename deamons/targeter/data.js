import { Data } from "/deamons/Data.js";
export class TargeterData extends Data {
    targets = [];
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.targeter = port.targeter ?? new TargeterData();
        return port.targeter;
    }
}
