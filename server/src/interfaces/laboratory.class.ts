import { MessageEmbed } from "discord.js";

import { EDrugsList } from "@global/interfaces/drug-stuff.interface";
import { ILaboratory } from "@global/interfaces/laboratory.interface";
import { CServerModel } from "./server.class";
import { CStock } from "./stock.class";

export class CLaboratory extends CServerModel implements ILaboratory {
    name: string;
    drug: EDrugsList;
    quantity: number;
    stocks: Array<CStock>;
    screen?: string;

    constructor(labo: ILaboratory) {
        super(labo);

        this.name = labo.name || "";
        this.drug = labo.drug;
        this.quantity = labo.quantity || 0;
        this.stocks = [];
        if (labo.stocks) {
            labo.stocks.forEach((stock, index) => this.stocks[index] = new CStock(stock));
        }
        this.screen = labo.screen || "";
    }

    public getInfo(embedMessage?: MessageEmbed): string {
        let stocksMsg = "";

        this.stocks.forEach((stock) => stocksMsg = stocksMsg.concat("**", stock.name, "**, "));
        stocksMsg = stocksMsg.substring(0, stocksMsg.length - 2);

        if (embedMessage) {
            embedMessage.addFields(
                { name: this.name, value: "**" + this.quantity.toString() + " kg** de **" + this.drug + "**", inline: true },
                { name: stocksMsg ? "Entrepôts" : "\u200B", value: stocksMsg || "\u200B", inline: true },
                { name: "\u200B", value: "\u200B", inline: true }
            );
        }
        return this.name.concat("**", this.quantity.toString(), " kg** de **", this.drug, "**.", stocksMsg ? " Entrepôts" : "\t", stocksMsg || "\t", "\n");
    }
}