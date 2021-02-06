import { CServer } from "@global/interfaces/server.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class LaboratoryDelLaboStock extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_DEL_STOCK, helpDesc, helpParams);
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
            this._schema.delLaboStockByNames(server, names.laboName, names.stockName)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}