import { IModel, CModel } from "./database.interface";
import { EDrugsList, EStuffList } from "./drug-stuff.interface";
import { CServer, IServer } from "./server.interface";

export interface IStock extends IModel {
    server: IServer;
    name: string;
    drug: EDrugsList | EStuffList;
    quantity: number;
    screen?: string;
}

export class CStock extends CModel {
    server: CServer;
    name: string;
    drug: EDrugsList | EStuffList;
    quantity: number;
    screen?: string;

    constructor(stock: IStock) {
        super(stock);

        this.server = new CServer(stock.server);
        this.name = stock.name;
        this.drug = stock.drug;
        this.quantity = stock.quantity;
        this.screen = stock.screen;
    }
}