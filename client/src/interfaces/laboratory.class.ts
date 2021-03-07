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
}