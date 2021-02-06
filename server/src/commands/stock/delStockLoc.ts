import { CServer } from "@global/interfaces/server.interface";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class StockDelStockLoc extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_DEL_LOC, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length < 1) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);

            if (!name) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.deleteByName(server, name)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}