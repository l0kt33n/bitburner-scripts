import { Data } from "/deamons/Data.js";
export class GameInfoData extends Data {
    bitNodeMultipliers = null;
    ownedSourceFiles = null;
    static instance(ns) {
        const port = Data.getDataPort(ns);
        port.gameInfo = port.gameInfo ?? new GameInfoData();
        return port.gameInfo;
    }
}
