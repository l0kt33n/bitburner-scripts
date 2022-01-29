import { Data } from "/deamons/Data.js";
export class ControllerData extends Data {
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.controller = port.controller ?? new ControllerData();
        return port.controller;
    }
}
