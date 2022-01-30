import { Deamon } from "/deamons/Deamon.js";
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    const deamon = new ExampleDeamon(ns);
}
class ExampleDeamon extends Deamon {
    constructor(ns) {
        super(ns);
    }
}
