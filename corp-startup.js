// Requires WarehouseAPI and OfficeAPI
// TODO: buy advert in Tobacco
import { log, getFilePath } from "./helpers.js";
import { getJobs } from "/corporation/utils.js";
import { getCities } from "/utils/utils.js";

export async function main(ns) {
    if (
        !ns.getOwnedSourceFiles().some((s) => s.n === 3 && s.lvl === 3) &&
        !ns.corporation.hasUnlockUpgrade("Warehouse API")
    )
        throw new Error(`This script requires the Warehouse API`);
    if (
        !ns.getOwnedSourceFiles().some((s) => s.n === 3 && s.lvl === 3) &&
        !ns.corporation.hasUnlockUpgrade("Office API")
    )
        throw new Error(`This script requires the Office API`);

    // Set up
    const cities = getCities();
    const jobs = getJobs();
    const division1 = "Agriculture";
    const division2 = "Tobacco";

    // Part 1
    await part1(ns, cities, jobs, division1);
    // Part 2
    await part2(ns, cities, jobs, division1);
    // Part 3
    await part3(ns, cities, jobs, division2);
    // Autopilot
    await launchManagers(ns);
}

export async function part1(ns, cities, jobs, division) {
    try {
        ns.corporation.getCorporation();
    } catch (e) {
        ns.corporation.createCorporation("Corporation", true);
    }
    const corp = ns.corporation;
    try {
        // Expand to division and get smart supply
        corp.expandIndustry("Agriculture", division);
        corp.unlockUpgrade("Smart Supply");
        corp.setSmartSupply(division, "Sector-12", true);
    } catch (err) {
        return;
    }
    for (let city of cities) {
        try {
            corp.expandCity(division, city);
            // Purchase warehouse
            corp.purchaseWarehouse(division, city);
        } catch {}
        // Hire three employees
        for (let i = 0; i < 3; i++) {
            corp.hireEmployee(division, city);
        }
        await corp.setAutoJobAssignment(division, city, "Operations", 1);
        await corp.setAutoJobAssignment(division, city, "Engineer", 1);
        await corp.setAutoJobAssignment(division, city, "Business", 1);
        // Upgrade warehouse twice
        for (let i = 0; i < 2; i++) {
            corp.upgradeWarehouse(division, city);
        }
        // Start selling material
        corp.sellMaterial(division, city, "Food", "MAX", "MP");
        corp.sellMaterial(division, city, "Plants", "MAX", "MP");
    }
    // Hire advert
    corp.hireAdVert(division);
    ns.print("Finished part1");
}

export async function part2(ns, cities, jobs, division) {
    const corp = ns.corporation;
    if (corp.getInvestmentOffer().round > 2) return;
    // Get upgrades
    for (let i = 0; i < 2; i++) {
        corp.levelUpgrade("FocusWires");
        corp.levelUpgrade("Neural Accelerators");
        corp.levelUpgrade("Speech Processor Implants");
        corp.levelUpgrade("Speech Processor Implants");
        corp.levelUpgrade("Smart Factories");
    }
    // Boost production
    for (let city of cities) {
        corp.buyMaterial(division, city, "Hardware", 12.5);
        corp.buyMaterial(division, city, "AI Cores", 7.5);
        corp.buyMaterial(division, city, "Real Estate", 2700);
        while (true) {
            let hardware = corp.getMaterial(division, city, "Hardware");
            let aiCores = corp.getMaterial(division, city, "AI Cores");
            let realEstate = corp.getMaterial(division, city, "Real Estate");

            if (hardware.qty >= 125)
                corp.buyMaterial(division, city, "Hardware", 0);
            if (aiCores.qty >= 75)
                corp.buyMaterial(division, city, "AI Cores", 0);
            if (realEstate.qty >= 27000)
                corp.buyMaterial(division, city, "Real Estate", 0);
            if (
                hardware.qty >= 125 &&
                aiCores.qty >= 75 &&
                realEstate.qty >= 27000
            )
                break;

            ns.print("Waiting for funds to buy materials");
            await ns.sleep(1000);
        }
    }
    await cookTheBook(ns);
    ns.print("Wait for investment offer of $210b");
    // Wait for investment offer of $210b
    while (corp.getInvestmentOffer().funds < 210e9) {
        ns.print("Current offer:" + corp.getInvestmentOffer().funds);
        await ns.sleep(1000);
    }
    ns.print("Accepting offer:" + corp.getInvestmentOffer().funds);
    corp.acceptInvestmentOffer();
    // Upgrade office size to nine
    for (let city of cities) {
        corp.upgradeOfficeSize(division, city, 6);
        // Hire 6 employees
        for (let i = 0; i < 6; i++) {
            corp.hireEmployee(division, city);
        }
        await corp.setAutoJobAssignment(division, city, "Operations", 2);
        await corp.setAutoJobAssignment(division, city, "Engineer", 2);
        await corp.setAutoJobAssignment(division, city, "Business", 1);
        await corp.setAutoJobAssignment(division, city, "Management", 2);
        await corp.setAutoJobAssignment(
            division,
            city,
            "Research & Development",
            2
        );
    }
    // Upgrade factories and storage
    for (let i = 0; i < 10; i++) {
        corp.levelUpgrade("Smart Factories");
        corp.levelUpgrade("Smart Storage");
    }
    // Upgrade warehouses
    for (let city of cities) {
        for (let i = 0; i < 7; i++) {
            corp.upgradeWarehouse(division, city);
        }
    }
    // Boost production
    for (let city of cities) {
        corp.buyMaterial(division, city, "Hardware", 267.5);
        corp.buyMaterial(division, city, "Robots", 9.6);
        corp.buyMaterial(division, city, "AI Cores", 244.5);
        corp.buyMaterial(division, city, "Real Estate", 11940);
        while (true) {
            let hardware = corp.getMaterial(division, city, "Hardware");
            let robots = corp.getMaterial(division, city, "Robots");
            let aiCores = corp.getMaterial(division, city, "AI Cores");
            let realEstate = corp.getMaterial(division, city, "Real Estate");

            if (hardware.qty >= 2800)
                corp.buyMaterial(division, city, "Hardware", 0);
            if (robots.qty >= 96) corp.buyMaterial(division, city, "Robots", 0);
            if (aiCores.qty >= 2520)
                corp.buyMaterial(division, city, "AI Cores", 0);
            if (realEstate.qty >= 146400)
                corp.buyMaterial(division, city, "Real Estate", 0);
            if (
                hardware.qty >= 2800 &&
                robots.qty >= 96 &&
                aiCores.qty >= 2520 &&
                realEstate.qty >= 146400
            )
                break;

            await ns.sleep(1000);
        }
    }
    await cookTheBook(ns);
    // Wait for investment offer of $5t
    while (corp.getInvestmentOffer().funds < 5e12) {
        await ns.sleep(1000);
    }
    corp.acceptInvestmentOffer();
    // Upgrade warehouses
    for (let city of cities) {
        for (let i = 0; i < 9; i++) {
            corp.upgradeWarehouse(division, city);
        }
    }
    // Boost production
    for (let city of cities) {
        corp.buyMaterial(division, city, "Hardware", 650);
        corp.buyMaterial(division, city, "Robots", 63);
        corp.buyMaterial(division, city, "AI Cores", 375);
        corp.buyMaterial(division, city, "Real Estate", 8400);
        while (true) {
            let hardware = corp.getMaterial(division, city, "Hardware");
            let robots = corp.getMaterial(division, city, "Robots");
            let aiCores = corp.getMaterial(division, city, "AI Cores");
            let realEstate = corp.getMaterial(division, city, "Real Estate");

            if (hardware.qty >= 9300)
                corp.buyMaterial(division, city, "Hardware", 0);
            if (robots.qty >= 726)
                corp.buyMaterial(division, city, "Robots", 0);
            if (aiCores.qty >= 6270)
                corp.buyMaterial(division, city, "AI Cores", 0);
            if (realEstate.qty >= 230400)
                corp.buyMaterial(division, city, "Real Estate", 0);
            if (
                hardware.qty >= 9300 &&
                robots.qty >= 726 &&
                aiCores.qty >= 6270 &&
                realEstate.qty >= 230400
            )
                break;

            await ns.sleep(1000);
        }
    }
}

export async function part3(ns, cities, jobs, division) {
    const corp = ns.corporation;
    try {
        if (corp.getDivision("Tobacco").products.length > 2) return;
    } catch {}
    try {
        // Expand into tobacco industry
        corp.expandIndustry("Tobacco", division);
    } catch (err) {}
    for (let city of cities) {
        try {
            corp.expandCity(division, city);
            // Purchase warehouse
            corp.purchaseWarehouse(division, city);
        } catch {}
        if (city === "Aevum") {
            // Upgrade Office size to 60
            corp.upgradeOfficeSize(division, city, 27);
            // Hire 60 employees
            for (let i = 0; i < 30; i++) {
                corp.hireEmployee(division, city);
            }
            await corp.setAutoJobAssignment(division, city, "Operations", 6);
            await corp.setAutoJobAssignment(division, city, "Engineer", 6);
            await corp.setAutoJobAssignment(division, city, "Business", 6);
            await corp.setAutoJobAssignment(division, city, "Management", 6);
            await corp.setAutoJobAssignment(
                division,
                city,
                "Research & Development",
                6
            );
        } else {
            // Upgrade Office size to nine
            corp.upgradeOfficeSize(division, city, 6);
            // Hire nine employees
            for (let i = 0; i < 9; i++) {
                corp.hireEmployee(division, city);
            }
            await corp.setAutoJobAssignment(division, city, "Operations", 2);
            await corp.setAutoJobAssignment(division, city, "Engineer", 2);
            await corp.setAutoJobAssignment(division, city, "Business", 1);
            await corp.setAutoJobAssignment(division, city, "Management", 2);
            await corp.setAutoJobAssignment(
                division,
                city,
                "Research & Development",
                2
            );
        }
    }
    //Start making Tobacco v1
    try {
        corp.getProduct(division, "1");
    } catch (err) {
        corp.makeProduct(division, "Aevum", "1", 1e9, 1e9);
    }
    // Get upgrades
    while (true) {
        if (corp.getUpgradeLevel("Wilson Analytics") < 14)
            corp.levelUpgrade("Wilson Analytics");
        if (corp.getUpgradeLevel("FocusWires") < 20)
            corp.levelUpgrade("FocusWires");
        if (corp.getUpgradeLevel("Neural Accelerators") < 20)
            corp.levelUpgrade("Neural Accelerators");
        if (corp.getUpgradeLevel("Speech Processor Implants") < 20)
            corp.levelUpgrade("Speech Processor Implants");
        if (corp.getUpgradeLevel("Nuoptimal Nootropic Injector Implants") < 20)
            corp.levelUpgrade("Nuoptimal Nootropic Injector Implants");

        if (
            corp.getUpgradeLevel("Wilson Analytics") >= 14 &&
            corp.getUpgradeLevel("FocusWires") >= 20 &&
            corp.getUpgradeLevel("Neural Accelerators") >= 20 &&
            corp.getUpgradeLevel("Speech Processor Implants") >= 20 &&
            corp.getUpgradeLevel("Nuoptimal Nootropic Injector Implants") >= 20
        )
            break;

        await ns.sleep(1000);
    }
    while (corp.funds > corp.getHireAdVertCost(division)) {
        corp.hireAdvert(division);
    }
}

async function launchManagers(ns) {
    let asynchronousHelpers = [
        {
            name: "corp-manager.js",
            shouldRun: () => playerStats.hasCorporation,
        }, // Script to create manage our corp for us
        {
            name: "corp-priceTuner.js",
            shouldRun: () => playerStats.hasCorporation,
        }, // Script to create manage our corp for us
        {
            name: "spend-hacknet-hashes.js",
            args: [
                "--spend-on",
                "Exchange_for_Corporation_Research",
                "-l",
                "-v",
            ],
            shouldRun: () => playerStats.hasCorporation,
        },
    ];
    asynchronousHelpers.forEach(
        (helper) => (helper.name = getFilePath(helper.name))
    );
    asynchronousHelpers.forEach((helper) => (helper.isLaunched = false));
    asynchronousHelpers.forEach((helper) => (helper.requiredServer = "home")); // All helpers should be launched at home since they use tempory scripts, and we only reserve ram on home

    await buildToolkit(ns); // build toolkit
    await runStartupScripts(ns); // Start helper scripts
}

/** @param {NS} ns **/
async function buildToolkit(ns) {
    log("buildToolkit");
    let allTools = hackTools
        .concat(asynchronousHelpers)
        .concat(periodicScripts);
    let toolCosts = await getNsDataThroughFile(
        ns,
        `Object.fromEntries(${JSON.stringify(allTools.map((t) => t.name))}` +
            `.map(s => [s, ns.getScriptRam(s, '${daemonHost}')]))`,
        "/Temp/script-costs.txt"
    );
    for (const toolConfig of allTools) {
        let tool = {
            instance: ns,
            name: toolConfig.name,
            shortName: toolConfig.shortName,
            tail: toolConfig.tail || false,
            args: toolConfig.args || [],
            shouldRun: toolConfig.shouldRun,
            requiredServer: toolConfig.requiredServer,
            isThreadSpreadingAllowed:
                toolConfig.threadSpreadingAllowed === true,
            cost: toolCosts[toolConfig.name],
            canRun: function (server) {
                return (
                    doesFileExist(this.name, server.name) &&
                    server.ramAvailable() >= this.cost
                );
            },
            getMaxThreads: function () {
                // analyzes the servers array and figures about how many threads can be spooled up across all of them.
                let maxThreads = 0;
                sortServerList("ram");
                for (const server of serverListByFreeRam.filter((s) =>
                    s.hasRoot()
                )) {
                    // Note: To be conservative, we allow double imprecision to cause this floor() to return one less than should be possible,
                    //       because the game likely doesn't account for this imprecision (e.g. let 1.9999999999999998 return 1 rather than 2)
                    var threadsHere = Math.floor(
                        server.ramAvailable() / this.cost /*.toPrecision(14)*/
                    );
                    if (!this.isThreadSpreadingAllowed) return threadsHere;
                    maxThreads += threadsHere;
                }
                return maxThreads;
            },
        };
        tools.push(tool);
        toolsByShortName[tool.shortName || hashToolDefinition(tool)] = tool;
    }
}

// Helper to kick off helper scripts
/** @param {NS} ns **/
async function runStartupScripts(ns) {
    for (const helper of asynchronousHelpers)
        if (
            !helper.isLaunched &&
            (helper.shouldRun === undefined || helper.shouldRun())
        )
            helper.isLaunched = await tryRunTool(ns, getTool(helper));
    // if every helper is launched already return "true" so we can skip doing this each cycle going forward.
    return asynchronousHelpers.reduce(
        (allLaunched, tool) => allLaunched && tool.isLaunched,
        true
    );
}

async function cookTheBook(ns) {
    const corp = ns.corporation.getCorporation();
    const division = "Agriculture";
    const cities = ns.corporation.getDivision(division).cities;
    for (let city of cities) {
        ns.corporation.sellMaterial(division, city, "Plants", 0, "MP");
        ns.corporation.sellMaterial(division, city, "Food", 0, "MP");
    }
    let storage =
        ns.corporation.getWarehouse("Agriculture", "Volhaven").sizeUsed /
        ns.corporation.getWarehouse("Agriculture", "Volhaven").size;
    while (storage < 0.98) {
        ns.print("Stocking up storage:" + storage);
        await ns.sleep(1000);
        storage =
            ns.corporation.getWarehouse("Agriculture", "Volhaven").sizeUsed /
            ns.corporation.getWarehouse("Agriculture", "Volhaven").size;
    }
    for (let city of cities) {
        ns.corporation.sellMaterial(division, city, "Plants", "MAX", "MP");
        ns.corporation.sellMaterial(division, city, "Food", "MAX", "MP");
    }
}