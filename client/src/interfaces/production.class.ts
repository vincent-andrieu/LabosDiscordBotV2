import { IProductions } from "@global/interfaces/production.interface";
import { CServerModel } from "./server.class";
import { CLaboratory } from "./laboratory.class";

export class CProductions extends CServerModel implements IProductions {
    labo: CLaboratory;
    quantity: number;
    finishDate: Date;
    description?: string;

    constructor(prod: IProductions) {
        super(prod);

        this.labo = new CLaboratory(prod.labo);
        this.quantity = prod.quantity;
        this.finishDate = prod.finishDate || new Date();
        this.description = prod.description;
    }
}