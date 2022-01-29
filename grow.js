export async function main(ns) {
    const target = ns.args[0];
    const threads = ns.args[1];
    const stock = ns.args[2];
    await ns.grow(target, { threads, stock });
}
