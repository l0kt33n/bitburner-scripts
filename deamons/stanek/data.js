import { Data } from "/deamons/Data.js";
export class StanekData extends Data {
    hello = "";
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.stanek = port.stanek ?? new StanekData();
        return port.stanek;
    }
}
