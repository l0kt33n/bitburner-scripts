import { Data } from "/deamons/Data.js";
export class StonksData extends Data {
    isStonks = false;
    stonksServer = "joesguns";
    stonksSymble = "JGN";
    forcast = { ask: 0, bid: 0 };
    effectHack = false;
    effectGrow = true;
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.stonks = port.stonks ?? new StonksData();
        return port.stonks;
    }
}
