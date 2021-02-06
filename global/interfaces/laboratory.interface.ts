import { IStock } from "./stock.interface";
import { IServerModel } from "./server.interface";
import { EDrugsList } from "./drug-stuff.interface";

export interface ILaboratory extends IServerModel {
    name: string;
    drug: EDrugsList;
    quantity?: number;
    stocks?: Array<IStock>;
    screen?: string;
}