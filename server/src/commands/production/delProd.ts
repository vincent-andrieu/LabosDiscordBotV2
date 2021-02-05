import { CServer } from "@global/interfaces/server.interface";
import { CLaboratory } from "@global/interfaces/laboratory.interface";
import { ProductionSchema } from "@schemas/productions.schema";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class ProductionDelProd extends CCommand<ProductionSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ProductionSchema(), ECommand.PROD_DEL, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { laboName: string | undefined, reason: string | undefined } {
        return { laboName: params[0], reason: params[1] };
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const names: { laboName: string | undefined, reason: string | undefined } = this.getParamsTemplate(params);

            this.getLabo(server, names.laboName)
                .then((labo: CLaboratory) => {
                    this._schema.deleteByLabo(labo, names.reason)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
        });
    }

    private getLabo(server: CServer, laboName: string | undefined): Promise<CLaboratory> {
        if (server.defaultLabo && !laboName) {
            return new Promise((resolve) => resolve(server.defaultLabo as CLaboratory));
        }
        return new LaboratorySchema().findOneByName(server, laboName as string, true);
    }

}