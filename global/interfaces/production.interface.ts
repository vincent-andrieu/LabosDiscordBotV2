import { MessageEmbed } from "discord.js";

import { CLaboratory, ILaboratory } from "./laboratory.interface";
import { CServerModel, IServerModel } from "./server.interface";
import { IStock } from "./stock.interface";

export interface IProductions extends IServerModel {
    labo: ILaboratory;
    quantity: number;
    finishDate?: Date;
    description?: string;
}

export class CProductions extends CServerModel implements IProductions {
    labo: CLaboratory;
    quantity: number;
    finishDate?: Date;
    description?: string;

    constructor(prod: IProductions) {
        super(prod);

        this.labo = new CLaboratory(prod.labo);
        this.quantity = prod.quantity;
        this.finishDate = prod.finishDate;
        this.description = prod.description;
    }

    public getInfo(embedMessage?: MessageEmbed): string {
        if (embedMessage) {
            embedMessage.addField("**" + this.labo.name + "**", "**" + this.quantity.toString() + " kg** de " + this.labo.drug + (this.description ? " (" + this.description + ")" : ""), true);
        }
        return ("**" + this.labo.name + "**").concat(" - **" + this.quantity.toString() + " kg** de " + this.labo.drug + (this.description ? " (" + this.description + ")" : "") + "\n");
    }
}

export interface IProdFinish extends IProductions {
    stock: IStock
}