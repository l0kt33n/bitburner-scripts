import { Data } from "/deamons/Data.js";
export class AccountantData extends Data {
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.accountant = port.accountant ?? new AccountantData();
        return port.accountant;
    }
}
