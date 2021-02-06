import { EDrugsList, EStuffList } from "./drug-stuff.interface";
import { IServerModel } from "./server.interface";

export interface IStock extends IServerModel {
    name: string;
    drug: EDrugsList | EStuffList;
    quantity?: number;
    screen?: string;
}