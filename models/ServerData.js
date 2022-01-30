//** Server object that only has static data on it **/
export class ServerData {
    name;
    playerOwned;
    organizationName;
    money;
    ram;
    security;
    growth;
    requiredHack;
    portsRequired;
    server;
    hasRootAccess = false;
    constructor(server) {
        this.name = server.hostname;
        this.playerOwned = server.purchasedByPlayer
            || server.hostname === "home"
            || server.hostname.startsWith("hacknet-node-");
        this.organizationName = server.organizationName;
        this.money = server.moneyMax;
        this.ram = server.maxRam;
        this.security = server.minDifficulty;
        this.growth = server.serverGrowth;
        this.requiredHack = server.requiredHackingSkill;
        this.portsRequired = server.numOpenPortsRequired;
        this.server = server;
    }
}
