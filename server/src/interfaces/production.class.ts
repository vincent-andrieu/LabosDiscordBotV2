import { MessageEmbed } from "discord.js";

import { IProductions } from "@global/interfaces/production.interface";
import { CServerModel } from "./server.class";
import { CLaboratory } from "./laboratory.class";

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