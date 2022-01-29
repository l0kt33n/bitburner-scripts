import { Data } from "/deamons/Data.js";
export class SleevesData extends Data {
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.sleeves = port.sleeves ?? new SleevesData();
        return port.sleeves;
    }
}
