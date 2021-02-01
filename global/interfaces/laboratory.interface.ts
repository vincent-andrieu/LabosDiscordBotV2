import { CStock, IStock } from "./stock.interface";
import { CServerModel, IServerModel } from "./server.interface";
import { EDrugsList } from "./drug-stuff.interface";

export interface ILaboratory extends IServerModel {
    name: string;
    drug: EDrugsList;
    quantity: number;
    stocks: Array<IStock>;
    screen?: string;
}

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
        this.quantity = labo.quantity;
        this.stocks = [];
        if (labo.stocks) {
            labo.stocks.forEach((stock, index) => this.stocks[index] = new CStock(stock));
        }
        this.screen = labo.screen;
    }
}