// Requires WarehouseAPI and OfficeAPI
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
    if (ns.getBitNodeMultipliers().CorporationValuation !== 1)
        throw new Error(
            `This script does not know how to deal with BitNodes that have a valuation modifier`
        );
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
    await autopilot(ns, cities, jobs, division2);
}

export async function part1(ns, cities, jobs, division) {
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
    ns.print("Wait for investment offer of $210b");
    cookTheBooks(ns, division, cities, ["Foods","Plants"]);
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
    // Wait for investment offer of $5t
    cookTheBooks(ns, division, cities, ["Foods","Plants"]);
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
    if(corp.getDivision("Tobacco").products.length > 2) return; 
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
            // Upgrade Office size to 30
            corp.upgradeOfficeSize(division, city, 27);
            // Hire 30 employees
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
    // Start making Tobacco v1
    try {
        corp.getProduct(division, "Tobacco v1")
    } catch (err) {
        corp.makeProduct(division, "Aevum", "Tobacco v1", 1e9, 1e9)
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
    // Wait for Tobacco v1 to finish
    while (corp.getProduct(division, "Tobacco v1").developmentProgress < 100) {
        await ns.sleep(1000);
    }
    // Start selling Tobacco v1 in all cities
    corp.sellProduct(division, "Aevum", "Tobacco v1", "MAX", "MP*2", true);
    // Start making Tobacco v2
    try {
        corp.getProduct(division, "Tobacco v2")
    } catch (err) {
        corp.makeProduct(division, "Aevum", "Tobacco v2", 1e9, 1e9)
    }
    // Upgrade Aevum office size
    while (corp.getOffice(division, "Aevum").size < 60) {
        corp.upgradeOfficeSize(division, "Aevum", 30);
        // Start selling Tobacco v2 and start making Tobacco v3 if it finishes
        if (
            corp.getProduct(division, "Tobacco v2").developmentProgress === 100
        ) {
            corp.sellProduct(
                division,
                "Aevum",
                "Tobacco v2",
                "MAX",
                "MP*4",
                true
            );
            try {
                corp.getProduct(division, "Tobacco v3")
            } catch (err) {
                corp.makeProduct(division, "Aevum", "Tobacco v3", 1e9, 1e9)
            }
        }
        await ns.sleep(1000);
    }
    await corp.setAutoJobAssignment(division, "Aevum", "Operations", 12);
    await corp.setAutoJobAssignment(division, "Aevum", "Engineer", 12);
    await corp.setAutoJobAssignment(division, "Aevum", "Business", 12);
    await corp.setAutoJobAssignment(division, "Aevum", "Management", 12);
    await corp.setAutoJobAssignment(
        division,
        "Aevum",
        "Research & Development",
        12
    );
    // Wait for Tobacco v2 to finish
    while (corp.getProduct(division, "Tobacco v2").developmentProgress < 100) {
        await ns.sleep(1000);
    }
    corp.sellProduct(division, "Aevum", "Tobacco v2", "MAX", "MP*4", true);
    if (!corp.getProduct(division, "Tobacco v3"))
        corp.makeProduct(division, "Aevum", "Tobacco v3", 1e9, 1e9);
}

export async function autopilot(ns, cities, jobs, division) {
    const corp = ns.corporation;
    // Assuming Tobacco v3 has already started
    let version = 3;
    while (!corp.getProduct(division, "Tobacco v" + version)) {
        await ns.sleep(1000);
    }
    while (true) {
        // Check tobacco progress
        if (
            corp.getProduct(division, "Tobacco v" + version)
                .developmentProgress === 100
        ) {
            // Start selling the developed version
            corp.sellProduct(
                division,
                "Aevum",
                "Tobacco v" + version,
                "MAX",
                "MP*" + 2 ** version,
                true
            );
            if (corp.hasResearched(division, "Market-TA.II"))
                corp.setProductMarketTA2(division, "Tobacco v" + version, true);
            // Discontinue previous version
            corp.discontinueProduct(division, "Tobacco v" + (version - 2));
            // Start making new version
            version++;
            if (!corp.getProduct(division, "Tobacco v" + version))
                corp.makeProduct(
                    division,
                    "Aevum",
                    "Tobacco v" + version,
                    1e9,
                    1e9
                );
        }
        // Check research progress for Market TA
        let researchCost = 0;
        if (!corp.hasResearched(division, "Market-TA.I"))
            researchCost += corp.getResearchCost(division, "Market-TA.I");
        if (!corp.hasResearched(division, "Market-TA.II"))
            researchCost += corp.getResearchCost(division, "Market-TA.II");
        if (
            researchCost > 0 &&
            corp.getDivision(division).research >= 1.5 * researchCost
        ) {
            if (!corp.hasResearched(division, "Market-TA.I"))
                corp.research(division, "Market-TA.I");
            if (!corp.hasResearched(division, "Market-TA.II")) {
                corp.research(division, "Market-TA.II");
                // Set Market TA.II on for the current selling versions
                corp.setProductMarketTA2(
                    division,
                    "Tobacco v" + (version - 2),
                    true
                );
                corp.setProductMarketTA2(
                    division,
                    "Tobacco v" + (version - 1),
                    true
                );
            }
        }
        // Upgrade Wilson analytics if we can
        corp.levelUpgrade("Wilson Analytics");
        // Check what is cheaper
        if (
            corp.getOfficeSizeUpgradeCost(division, "Aevum", 15) <
            corp.getHireAdVertCost(division)
        ) {
            // Upgrade office size in Aevum
            if (
                corp.getOfficeSizeUpgradeCost(division, "Aevum", 15) <=
                corp.getCorporation().funds
            ) {
                corp.upgradeOfficeSize(division, "Aevum", 15);
                for (let i = 0; i < 15; i++) {
                    corp.hireEmployee(division, "Aevum");
                }
                let dist = Math.floor(
                    corp.getOffice(division, "Aevum").size / 5
                );
                await corp.setAutoJobAssignment(
                    division,
                    "Aevum",
                    "Operations",
                    dist
                );
                await corp.setAutoJobAssignment(
                    division,
                    "Aevum",
                    "Engineer",
                    dist
                );
                await corp.setAutoJobAssignment(
                    division,
                    "Aevum",
                    "Business",
                    dist
                );
                await corp.setAutoJobAssignment(
                    division,
                    "Aevum",
                    "Management",
                    dist
                );
                await corp.setAutoJobAssignment(
                    division,
                    "Aevum",
                    "Research & Development",
                    dist
                );
            }
        }
        // Hire advert
        else if (
            corp.getHireAdVertCost(division) <= corp.getCorporation().funds
        )
            corp.hireAdVert(division);
    }
}

export function cookTheBooks(ns, division, cities, products){
    const corp = ns.corporation;
    // set all products in all cities to sell 0
    for(let city in cities){
        for(let product in products){
            corp.sellMaterial(division, city, product, "0", "MP");
        }
    }
    //wait for storage to be at capacity
    while(corp.getWarehouse(division, cities[-1]).sizeUsed<corp.getWarehouse(division, cities[-1]).size*0.95){
        ns.sleep(1000);
    }
    //set all products in all cities to sell 1
    for(let city in cities){
        for(let product in products){
            corp.sellMaterial(division, city, product, "MAX", "MP");
        }
    }
}