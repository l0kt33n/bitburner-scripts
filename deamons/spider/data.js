import { Data } from "/deamons/Data.js";
export class SpiderData extends Data {
    routes = {
        "CSEC": [],
        "avmnite-02h": [],
        "I.I.I.I": [],
        "run4theh111z": [],
        "fulcrumassets": [],
        "w0r1d_d43m0n": []
    };
    servers = [];
    routedServers = [];
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.spider = port.spider ?? new SpiderData();
        return port.spider;
    }
}
