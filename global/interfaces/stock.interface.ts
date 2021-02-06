import { EDrugsList, EStuffList } from "./drug-stuff.interface";
import { CServerModel, IServerModel } from "./server.interface";

export interface IStock extends IServerModel {
    name: string;
    drug: EDrugsList | EStuffList;
    quantity?: number;
    screen?: string;
}

export class CStock extends CServerModel implements IStock {
    name: string;
    drug: EDrugsList | EStuffList;
    quantity: number;
    screen?: string;

    constructor(stock: IStock) {
        super(stock);

        this.name = stock.name;
        this.drug = stock.drug;
        this.quantity = stock.quantity || 0;
        this.screen = stock.screen;
    }
}