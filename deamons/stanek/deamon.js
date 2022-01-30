import { Deamon } from "/deamons/Deamon.js";
import { StaticConfig } from "/StaticConfig";
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    const deamon = new StanekDeamon(ns);
    await deamon.run();
}
class StanekDeamon extends Deamon {
    starter = [
        { "rootX": 0, "rootY": 0, "rotation": 0, "fragmentId": 20, "type": 12 },
        { "rootX": 4, "rootY": 0, "rotation": 0, "fragmentId": 21, "type": 13 },
        { "rootX": 3, "rootY": 3, "rotation": 0, "fragmentId": 12, "type": 8 },
        { "rootX": 0, "rootY": 3, "rotation": 0, "fragmentId": 14, "type": 9 },
        { "rootX": 3, "rootY": 2, "rotation": 0, "fragmentId": 10, "type": 7 },
        { "rootX": 0, "rootY": 2, "rotation": 0, "fragmentId": 16, "type": 10 },
        { "rootX": 0, "rootY": 1, "rotation": 0, "fragmentId": 101, "type": 18 }
    ];
    hack = [
        { "rootX": 0, "rootY": 0, "rotation": 1, "fragmentId": 6, "type": 4 },
        { "rootX": 4, "rootY": 0, "rotation": 1, "fragmentId": 5, "type": 3 },
        { "rootX": 2, "rootY": 0, "rotation": 0, "fragmentId": 0, "type": 6 },
        { "rootX": 1, "rootY": 2, "rotation": 0, "fragmentId": 102, "type": 18 },
        { "rootX": 3, "rootY": 3, "rotation": 0, "fragmentId": 1, "type": 6 },
        { "rootX": 0, "rootY": 4, "rotation": 0, "fragmentId": 20, "type": 12 },
        { "rootX": 1, "rootY": 0, "rotation": 1, "fragmentId": 7, "type": 5 }
    ];
    blade = [
        { "rootX": 3, "rootY": 0, "rotation": 0, "fragmentId": 30, "type": 17 },
        { "rootX": 3, "rootY": 3, "rotation": 0, "fragmentId": 12, "type": 8 },
        { "rootX": 1, "rootY": 0, "rotation": 0, "fragmentId": 10, "type": 7 },
        { "rootX": 2, "rootY": 1, "rotation": 2, "fragmentId": 101, "type": 18 },
        { "rootX": 0, "rootY": 0, "rotation": 1, "fragmentId": 16, "type": 10 },
        { "rootX": 2, "rootY": 3, "rotation": 2, "fragmentId": 14, "type": 9 },
        { "rootX": 0, "rootY": 2, "rotation": 1, "fragmentId": 18, "type": 11 }
    ];
    constructor(ns) {
        super(ns);
    }
    async run() {
        //console.log(fullFrags);
        const fragments = this.blade;
        const size = this.ns.getScriptRam("stanek.js");
        let lastthreads = 0;
        let lastServer = null;
        for (let i = 1; i < this.resourceManagerData.resources.length; i++) {
            const resource = this.resourceManagerData.resources[i];
            const used = this.ns.getServerUsedRam(resource.name);
            const total = resource.name === "home" ? Math.max(0, resource.ram - StaticConfig.homeReserve(resource.ram)) : resource.ram;
            const free = Math.max(0, total - used);
            const maxTheads = Math.max(0, Math.floor(free / size));
            if (maxTheads > lastthreads) {
                lastthreads = maxTheads;
                lastServer = resource;
            }
        }
        if (lastServer === null)
            return;
        const chargable = fragments.filter(f => f.type !== FragmentType.None && f.type !== FragmentType.Delete && f.type !== FragmentType.Booster);
        // Average charge is something to do with threads used.
        // More threads in one charge is better, use a set number of threads only on big servers to run shit.
        // Charge one thing till avgCharge stops moving much then swap to the next
        for (const fragment of chargable) {
            //let threads = theadsPerFragment;
            let current = Math.round((this.ns.stanek.activeFragments().find(f => f.id === fragment.fragmentId)?.avgCharge ?? 0) * 10) / 10;
            let last = 0;
            while ((last === 0 || current > last || current < last)) {
                const resource = lastServer;
                const used = this.ns.getServerUsedRam(resource.name);
                const total = resource.name === "home" ? Math.max(0, resource.ram - StaticConfig.homeReserve(resource.ram)) : resource.ram;
                const free = Math.max(0, total - used);
                const maxTheads = Math.max(0, Math.floor(free / size));
                if (maxTheads < 1)
                    continue;
                this.ns.exec("stanek.js", resource.name, maxTheads, fragment.rootX, fragment.rootY, Math.random());
                last = current;
                this.ns.print(`${fragment.fragmentId} is at ${current}`);
                await this.ns.sleep(1500);
                current = Math.round((this.ns.stanek.activeFragments().find(f => f.id === fragment.fragmentId)?.avgCharge ?? 0) * 10) / 10;
            }
        }
    }
}
var FragmentType;
(function (FragmentType) {
    // Special fragments for the UI
    FragmentType[FragmentType["None"] = 0] = "None";
    FragmentType[FragmentType["Delete"] = 1] = "Delete";
    // Stats boosting fragments
    FragmentType[FragmentType["HackingChance"] = 2] = "HackingChance";
    FragmentType[FragmentType["HackingSpeed"] = 3] = "HackingSpeed";
    FragmentType[FragmentType["HackingMoney"] = 4] = "HackingMoney";
    FragmentType[FragmentType["HackingGrow"] = 5] = "HackingGrow";
    FragmentType[FragmentType["Hacking"] = 6] = "Hacking";
    FragmentType[FragmentType["Strength"] = 7] = "Strength";
    FragmentType[FragmentType["Defense"] = 8] = "Defense";
    FragmentType[FragmentType["Dexterity"] = 9] = "Dexterity";
    FragmentType[FragmentType["Agility"] = 10] = "Agility";
    FragmentType[FragmentType["Charisma"] = 11] = "Charisma";
    FragmentType[FragmentType["HacknetMoney"] = 12] = "HacknetMoney";
    FragmentType[FragmentType["HacknetCost"] = 13] = "HacknetCost";
    FragmentType[FragmentType["Rep"] = 14] = "Rep";
    FragmentType[FragmentType["WorkMoney"] = 15] = "WorkMoney";
    FragmentType[FragmentType["Crime"] = 16] = "Crime";
    FragmentType[FragmentType["Bladeburner"] = 17] = "Bladeburner";
    // utility fragments.
    FragmentType[FragmentType["Booster"] = 18] = "Booster";
})(FragmentType || (FragmentType = {}));
