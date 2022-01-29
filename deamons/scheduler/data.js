import { Data } from "/deamons/Data.js";
export class SchedulerData extends Data {
    hackPids = [];
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new SchedulerData();
        return port.scheduler;
    }
}
