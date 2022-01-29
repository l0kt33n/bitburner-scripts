import { Data } from "/deamons/Data.js";
export class ExampleData extends Data {
    hello = "";
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.scheduler = port.scheduler ?? new ExampleData();
        return port.scheduler;
    }
}
