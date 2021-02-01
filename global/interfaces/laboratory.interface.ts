import { CModel, IModel } from "./database.interface";
import { CStock, IStock } from "./stock.interface";
import { IServer, CServer } from "./server.interface";
import { EDrugsList } from "./drug-stuff.interface";

export interface ILaboratory extends IModel {
    server: IServer;
    name: string;
    drug: EDrugsList;
    quantity: number;
    stocks: Array<IStock>;
    screen?: string;
}

export class CLaboratory extends CModel {
    server: CServer;
    name: string;
    drug: EDrugsList;
    quantity: number;
    stocks: Array<CStock>;
    screen?: string;

    constructor(labo: ILaboratory) {
        super(labo);

        this.server = new CServer(labo.server);
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