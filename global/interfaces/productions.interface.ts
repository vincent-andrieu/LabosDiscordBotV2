import { CLaboratory, ILaboratory } from "./laboratory.interface";
import { CModel, IModel } from "./database.interface";
import { CServer, IServer } from "./server.interface";

export interface IProductions extends IModel {
    server: IServer;
    labo: ILaboratory;
    quantity: number;
    finishDate: Date;
    description?: string;
}

export class CProductions extends CModel {
    server: CServer;
    labo: CLaboratory;
    quantity: number;
    finishDate: Date;
    description?: string;

    constructor(prod: IProductions) {
        super(prod);

        this.server = new CServer(prod.server);
        this.labo = new CLaboratory(prod.labo);
        this.quantity = prod.quantity;
        this.finishDate = prod.finishDate;
        this.description = prod.description;
    }
}