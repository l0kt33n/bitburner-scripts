export class Data {
    initialised = false;
    static getDataPort(ns) {
        // TODO: Can't we just use globalhandle?
        // Namespace out our port object
        // @ts-ignore
        ns.getPortHandle(19).pigalot = ns.getPortHandle(19).pigalot ?? {};
        // Set/Get our main data object
        // @ts-ignore
        ns.getPortHandle(19).pigalot.data = ns.getPortHandle(19).pigalot.data ?? {};
        // @ts-ignore
        globalThis["pigalot-data"] = globalThis["pigalot-data"] ?? ns.getPortHandle(19).pigalot.data;
        // @ts-ignore
        return ns.getPortHandle(19).pigalot.data;
    }
}
