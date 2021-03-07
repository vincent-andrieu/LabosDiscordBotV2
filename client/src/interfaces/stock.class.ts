import { EDrugsList, EStuffList } from "@global/interfaces/drug-stuff.interface";
import { IStock } from "@global/interfaces/stock.interface";
import { CServerModel } from "./server.class";

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