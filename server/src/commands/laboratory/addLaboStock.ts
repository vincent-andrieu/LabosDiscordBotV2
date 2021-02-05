import { CServer } from "@global/interfaces/server.interface";
import { CLaboratory } from "@global/interfaces/laboratory.interface";
import { CStock } from "@global/interfaces/stock.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@commands/commands";
import { StockSchema } from "@schemas/stocks.schema";

export default class LaboratoryAddLaboStock extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_ADD_STOCK, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { laboName: string, stockName: string } | undefined {
        if (params.length < 2) {
            return undefined;
        }
        return { laboName: params[0], stockName: params[1] };
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const names: { laboName: string, stockName: string } | undefined = this.getParamsTemplate(params);

            if (!names) {
                return reject("Paramètres de la commande invalide");
            }
            Promise.all([
                this._schema.findOneByName(server, names.laboName, true),
                new StockSchema().findOneByName(server, names.stockName, true)
            ]).then((result: [CLaboratory, CStock]) =>
                this._schema.addLaboStock(result[0], result[1])
                    .then(() => resolve())
                    .catch((err) => reject(err))
            ).catch((err) => reject(err));
        });
    }

}