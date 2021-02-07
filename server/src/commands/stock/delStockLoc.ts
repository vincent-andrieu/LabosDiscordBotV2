import { CServer } from "@interfaces/server.class";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";

export default class StockDelStockLoc extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_DEL_LOC, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { name: string, reason?: string } | undefined {
        if (params.length < 1) {
            return undefined;
        }
        return {
            name: params[0],
            reason: params[1]
        };
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const paramsValues: { name: string, reason?: string } | undefined = this.getParamsTemplate(params);

            if (!paramsValues) {
                help(server, this);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.deleteByName(server, paramsValues.name, paramsValues.reason)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}