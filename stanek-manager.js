export class StanekDeamon {
    async run(ns) {
        //console.log(fullFrags);
        const fragments = JSON.stringify(
            ns.stanek.activeFragments().map((f) => ({
                rootX: f.x,
                rootY: f.y,
                rotation: f.rotation,
                fragmentId: f.id,
                type: f.type,
            }))
        );
        const size = ns.getScriptRam("stanek.js");
        let lastthreads = 0;
        let lastServer = null;
        const resource = "home";
        const used = ns.getServerUsedRam(resource);
        const total =
            resource === "home"
                ? Math.max(0, ns.getServerMaxRam(resource))
                : ns.getServerMaxRam(resource);
        const free = Math.max(0, total - used);
        const maxTheads = Math.max(0, Math.floor(free / size));
        if (maxTheads > lastthreads) {
            lastthreads = maxTheads;
            lastServer = resource;
        }
        if (lastServer === null) return;
        const chargable = fragments;
        // const chargable = fragments.filter(
        //     (f) =>
        //         f.type !== FragmentType.None &&
        //         f.type !== FragmentType.Delete &&
        //         f.type !== FragmentType.Booster
        // );
        // Average charge is something to do with threads used.
        // More threads in one charge is better, use a set number of threads only on big servers to run shit.
        // Charge one thing till avgCharge stops moving much then swap to the next
        for (const fragment of chargable) {
            //let threads = theadsPerFragment;
            let current =
                Math.round(
                    (ns.stanek
                        .activeFragments()
                        .find((f) => f.id === fragment.fragmentId)?.avgCharge ??
                        0) * 10
                ) / 10;
            let last = 0;
            while (last === 0 || current > last || current < last) {
                const resource = lastServer;
                const used = ns.getServerUsedRam(resource);
                const total =
                    resource === "home"
                        ? Math.max(0, ns.getServerMaxRam(resource))
                        : ns.getServerMaxRam(resource);
                const free = Math.max(0, total - used);
                const maxTheads = Math.max(0, Math.floor(free / size));
                if (maxTheads < 1) continue;
                ns.exec(
                    "stanek.js",
                    resource,
                    maxTheads,
                    fragment.rootX,
                    fragment.rootY,
                    Math.random()
                );
                last = current;
                ns.print(`${fragment.fragmentId} is at ${current}`);
                await ns.sleep(1500);
                current =
                    Math.round(
                        (ns.stanek
                            .activeFragments()
                            .find((f) => f.id === fragment.fragmentId)
                            ?.avgCharge ?? 0) * 10
                    ) / 10;
            }
        }
    }
}

var FragmentType;
(function (FragmentType) {
    // Special fragments for the UI
    FragmentType[(FragmentType["None"] = 0)] = "None";
    FragmentType[(FragmentType["Delete"] = 1)] = "Delete";
    // Stats boosting fragments
    FragmentType[(FragmentType["HackingChance"] = 2)] = "HackingChance";
    FragmentType[(FragmentType["HackingSpeed"] = 3)] = "HackingSpeed";
    FragmentType[(FragmentType["HackingMoney"] = 4)] = "HackingMoney";
    FragmentType[(FragmentType["HackingGrow"] = 5)] = "HackingGrow";
    FragmentType[(FragmentType["Hacking"] = 6)] = "Hacking";
    FragmentType[(FragmentType["Strength"] = 7)] = "Strength";
    FragmentType[(FragmentType["Defense"] = 8)] = "Defense";
    FragmentType[(FragmentType["Dexterity"] = 9)] = "Dexterity";
    FragmentType[(FragmentType["Agility"] = 10)] = "Agility";
    FragmentType[(FragmentType["Charisma"] = 11)] = "Charisma";
    FragmentType[(FragmentType["HacknetMoney"] = 12)] = "HacknetMoney";
    FragmentType[(FragmentType["HacknetCost"] = 13)] = "HacknetCost";
    FragmentType[(FragmentType["Rep"] = 14)] = "Rep";
    FragmentType[(FragmentType["WorkMoney"] = 15)] = "WorkMoney";
    FragmentType[(FragmentType["Crime"] = 16)] = "Crime";
    FragmentType[(FragmentType["Bladeburner"] = 17)] = "Bladeburner";
    // utility fragments.
    FragmentType[(FragmentType["Booster"] = 18)] = "Booster";
})(FragmentType || (FragmentType = {}));

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
    const deamon = new StanekDeamon();
    await deamon.run(ns);
}
