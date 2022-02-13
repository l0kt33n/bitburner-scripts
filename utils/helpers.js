/** @param {import("NetscriptDefinitions").NS } ns */
export async function getServers(ns, ignoreHackingRequirement = false) {
    var servers = ns.scan("home").map(x => ({
        server: ns.getServer(x),
        path: ["home"]
    }))
    let length = -1
    while (servers.length != length) {
        length = servers.length
        servers.forEach(({
            server: {
                hostname
            },
            path
        }) => {
            let neighbors = ns.scan(hostname)
            let missingHosts = neighbors
                .filter((neighbor) => neighbor != "home" && !servers.find((x) => x.server.hostname == neighbor))
                .map(x => ({
                    server: ns.getServer(x),
                    path: path.concat(hostname)
                }))
            servers = servers.concat(missingHosts);
        })
    }

    const connectPathsFromHome = servers.reduce((acc, {
        server,
        path
    }) => {
        acc[server.hostname] = {
            path,
            server
        }
        return acc
    }, {})

    servers = servers.reduce((acc, {
        server,
    }) => {
        if (ignoreHackingRequirement || (ns.getHackingLevel() >= server.requiredHackingSkill)) {
            acc.push(server)
        }
        return acc
    }, [])

    return {
        connectPathsFromHome,
        servers,
        serversWithCash: servers.filter(({
            hostname,
            moneyMax
        }) => !hostname.includes("pserv-") && moneyMax > 0 && hostname != "darkweb")
    }
}

/** @param {import("NetscriptDefinitions").NS } ns */
export async function log(ns, filename, content) {
    await ns.write(filename, content + '\n')
}


export function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

export function uniqify(array) {
    return [...new Set(array)]
}

export function getRandomString() {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < 4; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

export const MaterialSizes = {
    Water: 0.05,
    Energy: 0.01,
    Food: 0.03,
    Plants: 0.05,
    Metal: 0.1,
    Hardware: 0.06,
    Chemicals: 0.05,
    Drugs: 0.02,
    Robots: 0.5,
    AICores: 0.1,
    RealEstate: 0.005,
}

export const IndustrialFactors = {
    Energy: {
        reFac :0.65,
        sciFac:0.7,
        hwFac :0,
        robFac:0.05,
        aiFac :0.3,
        advFac:0.08,
    },
    Utilities: {
        reFac :0.5,
        sciFac:0.6,
        hwFac :0,
        robFac:0.4,
        aiFac :0.4,
        advFac:0.08,
    },
    Agriculture: {
        reFac :0.72,
        sciFac:0.5,
        hwFac :0.2,
        robFac:0.3,
        aiFac :0.3,
        advFac:0.04,
    },
    Fishing: {
        reFac :0.15,
        sciFac:0.35,
        hwFac :0.35,
        robFac:0.5,
        aiFac :0.2,
        advFac:0.08,
    },
    Mining: {
        reFac :0.3,
        sciFac:0.26,
        hwFac :0.4,
        robFac:0.45,
        aiFac :0.45,
        advFac:0.06,
    },
    Food: {
        reFac :0.05,
        sciFac:0.12,
        hwFac :0.15,
        robFac:0.3,
        aiFac :0.25,
        advFac:0.25,
    },
    Tobacco: {
        reFac :0.15,
        sciFac:0.75,
        hwFac :0.15,
        robFac:0.2,
        aiFac :0.15,
        advFac:0.2,
    },
    Chemical: {
        reFac :0.25,
        sciFac:0.75,
        hwFac :0.2,
        robFac:0.25,
        aiFac :0.2,
        advFac:0.07,
    },
    Pharmaceutical: {
        reFac :0.05,
        sciFac:0.8,
        hwFac :0.15,
        robFac:0.25,
        aiFac :0.2,
        advFac:0.16,
    },
    Computer: {
        reFac :0.2,
        sciFac:0.62,
        hwFac :0,
        robFac:0.36,
        aiFac :0.19,
        advFac:0.17,
    },
    Robotics: {
        reFac :0.32,
        sciFac:0.65,
        hwFac :0.19,
        robFac:0,
        aiFac :0.36,
        advFac:0.18,
    },
    Software: {
        reFac :0.15,
        sciFac:0.62,
        hwFac :0.25,
        robFac:0.05,
        aiFac :0.18,
        advFac:0.16,
    },
    Healthcare: {
        reFac :0.1,
        sciFac:0.75,
        hwFac :0.1,
        robFac:0.1,
        aiFac :0.1,
        advFac:0.11,
    },
    RealEstate: {
        reFac :0,
        sciFac:0.05,
        hwFac :0.05,
        robFac:0.6,
        aiFac :0.6,
        advFac:0.25,
    }
}

/** @param {import("../.").NS} ns */
export function calc_material(ns, warehouse_size, industry) {
    var realEstate = {
        amount: 0,
        size: MaterialSizes.RealEstate,
        factor: IndustrialFactors[industry].reFac
    };
    var hardware = {
        amount: 0,
        size: MaterialSizes.Hardware,
        factor: IndustrialFactors[industry].hwFac
    };
    var robots = {
        amount: 0,
        size: MaterialSizes.Robots,
        factor: IndustrialFactors[industry].robFac
    };
    var aiCores = {
        amount: 0,
        size: MaterialSizes.AICores,
        factor: IndustrialFactors[industry].aiFac
    };

    var materials = [realEstate, hardware, robots, aiCores];
    var bad_materials = [];
    var not_to_calculate_materials = materials.filter(m => m.factor == 0);

    do {
        var total_factor = 0;
        var total_size = 0;
        for (const material of materials) {
            total_factor += material.factor;
            total_size += material.size;
        }
        for (var material of materials) {
            if (!not_to_calculate_materials.includes(material)) {
                material.amount = Math.floor(material.factor / material.size / total_factor * (warehouse_size + 
                    500 * (total_size - total_factor / material.factor * material.size)));
            }
        }
        bad_materials = materials.filter(m => m.amount < 0);
        not_to_calculate_materials = materials.filter(m => m.amount <= 0);
        for (var material of bad_materials) {
            material.amount = 0;
            material.size = 0;
            material.factor = 0;
        }
    } while(bad_materials.length)

    return {
        'Real Estate': realEstate,
        'Hardware': hardware,
        'Robots': robots,
        'AI Cores': aiCores,
    };
}