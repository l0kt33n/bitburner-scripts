import { Data } from "/deamons/Data.js";
export class BladeData extends Data {
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.blade = port.blade ?? new BladeData();
        return port.blade;
    }
}
