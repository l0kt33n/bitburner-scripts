import { Deamon } from "/deamons/Deamon.js";
export async function main(ns) {
    //ns.disableLog("ALL");
    ns.clearLog();
    ns.tail();
    const deamon = new StonksDeamon(ns);
    await deamon.run();
}
class StonksDeamon extends Deamon {
    historyLength = 100;
    bidThreashold = 10000;
    askThreashold = 50;
    commission = 100000;
    FourSigmaMarketDataBasePrice = 25e9;
    askHistory = [];
    bidHistory = [];
    lastAsk;
    lastBid;
    constructor(ns) {
        super(ns);
        this.lastAsk = ns.stock.getAskPrice(this.stonksData.stonksSymble);
        this.lastBid = ns.stock.getBidPrice(this.stonksData.stonksSymble);
    }
    async run() {
        if (!this.stonksData.isStonks)
            return;
        while (true) {
            //this.ns.clearLog();
            const [shares, avgPx, sharesShort, avgPxShort] = this.ns.stock.getPosition(this.stonksData.stonksSymble);
            const ask = this.ns.stock.getAskPrice(this.stonksData.stonksSymble);
            const bid = this.ns.stock.getBidPrice(this.stonksData.stonksSymble);
            const player = this.ns.getPlayer();
            if (!player.has4SDataTixApi) {
                const fourSigmaPrice = this.FourSigmaMarketDataBasePrice * (this.gameInfoData.bitNodeMultipliers?.FourSigmaMarketDataApiCost ?? 1);
                if (player.money > fourSigmaPrice + 200000) {
                    this.ns.stock.purchase4SMarketDataTixApi();
                }
            }
            if (!player.has4SDataTixApi) {
                if (this.lastAsk !== ask || this.lastBid !== bid) {
                    this.stonksData.forcast = this.addHistory(ask, bid);
                }
                this.lastAsk = ask;
                this.lastBid = bid;
                if (this.askHistory.length !== this.historyLength && this.bidHistory.length !== this.historyLength) {
                    this.ns.print(`History ${this.askHistory.length}/${this.historyLength}`);
                    await this.ns.sleep(1000);
                    continue; // Build more history before we do anything
                }
            }
            else {
                const forcast = this.ns.stock.getForecast(this.stonksData.stonksSymble);
                this.stonksData.forcast.ask = forcast;
                this.stonksData.forcast.bid = forcast;
            }
            if (shares > 0) {
                this.ns.print("currently long");
                // long
                if (bid >= this.bidThreashold) {
                    this.ns.print("bid threashold met");
                    this.stonksData.effectHack = true;
                    this.stonksData.effectGrow = false;
                    if (this.stonksData.forcast.bid < 0.5) { // Going down
                        this.ns.print("forcast going down time to swap position");
                        // Sell
                        this.ns.stock.sell(this.stonksData.stonksSymble, shares);
                        // Short
                        this.buy("s", bid, ask);
                    }
                }
                else {
                    // Keep growing
                    this.stonksData.effectHack = false;
                    this.stonksData.effectGrow = true;
                }
            }
            else if (sharesShort > 0) {
                this.ns.print("currently short");
                // short
                if (ask <= this.askThreashold) {
                    this.ns.print("ask threashold met");
                    this.stonksData.effectHack = false;
                    this.stonksData.effectGrow = true;
                    if (this.stonksData.forcast.ask > 0.5) { // Going up
                        this.ns.print("forcast going up time to swap position");
                        // Sell
                        this.ns.stock.sellShort(this.stonksData.stonksSymble, sharesShort);
                        // Buy
                        this.buy("l", bid, ask);
                    }
                }
                else {
                    // keep hacking
                    this.stonksData.effectHack = true;
                    this.stonksData.effectGrow = false;
                }
            }
            else {
                // no position
                const a = Math.abs(bid - this.bidThreashold);
                const b = Math.abs(ask - this.askThreashold);
                if (a > b || bid > this.bidThreashold) {
                    // closer to ask
                    this.ns.print("closer to ask");
                    // Short
                    this.buy("s", bid, ask);
                    this.stonksData.effectHack = true;
                    this.stonksData.effectGrow = false;
                }
                else if (b > a || ask < this.askThreashold) {
                    // closer to bid
                    this.ns.print("closer to bid");
                    // buy
                    this.buy("l", bid, ask);
                    this.stonksData.effectHack = false;
                    this.stonksData.effectGrow = true;
                }
                else {
                    // buy
                    this.buy("l", bid, ask);
                    this.stonksData.effectHack = false;
                    this.stonksData.effectGrow = true;
                }
            }
            this.stonksData.initialised = true;
            await this.ns.sleep(1000);
        }
    }
    buy(type, bid, ask) {
        const player = this.ns.getPlayer();
        const budget = player.money * .5;
        let affordableShares = Math.floor((budget - this.commission) / (type === "s" ? bid : ask));
        const sharesToGet = Math.min(this.ns.stock.getMaxShares(this.stonksData.stonksSymble), affordableShares);
        if (type === "l") {
            const p = this.ns.stock.buy(this.stonksData.stonksSymble, sharesToGet);
            this.ns.print(`buying ${p}/${sharesToGet} shares.`);
        }
        else {
            const p = this.ns.stock.short(this.stonksData.stonksSymble, sharesToGet);
            this.ns.print(`shorting ${p}/${sharesToGet} shares.`);
        }
    }
    addHistory(ask, bid) {
        const askLength = this.askHistory.unshift(ask);
        if (askLength > this.historyLength)
            this.askHistory.pop();
        const bidLength = this.bidHistory.unshift(bid);
        if (bidLength > this.historyLength)
            this.bidHistory.pop();
        return {
            ask: this.forecast(this.askHistory),
            bid: this.forecast(this.bidHistory)
        };
    }
    forecast(history) {
        return history.reduce((ups, price, idx) => idx == 0 ? 0 : (history[idx - 1] > price ? ups + 1 : ups), 0) / (history.length - 1);
    }
}
