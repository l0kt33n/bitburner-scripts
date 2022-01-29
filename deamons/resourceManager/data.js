import { Data } from "/deamons/Data.js";
export class ResourceManagerData extends Data {
    resources = [];
    totalRam = 0;
    homeCoreMult = 0;
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.resourceManager = port.resourceManager ?? new ResourceManagerData();
        return port.resourceManager;
    }
}
