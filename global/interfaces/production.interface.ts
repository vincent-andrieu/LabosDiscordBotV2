import { MessageEmbed } from "discord.js";

import { ILaboratory } from "./laboratory.interface";
import { IServerModel } from "./server.interface";
import { IStock } from "./stock.interface";

export interface IProductions extends IServerModel {
    labo: ILaboratory;
    quantity: number;
    finishDate?: Date;
    description?: string;
}

export interface IProdFinish extends IProductions {
    stock: IStock
}