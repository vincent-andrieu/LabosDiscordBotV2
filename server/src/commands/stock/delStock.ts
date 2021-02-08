import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";
import { StockSchema } from "@schemas/stocks.schema";
import { help } from "@commands/help/help";

export default class StockDelStock extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_DEL, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { name: string, quantity: number, reason?: string } | undefined {
        const nbrQty = Number(params[1]);
        if (params.length < 2 || !nbrQty) {
            return undefined;
        }
        return {
            name: params[0],
            quantity: nbrQty,
            reason: this.concatLastParams(params, 2)
        };
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const paramsValues: { name: string, quantity: number, reason?: string } | undefined = this.getParamsTemplate(params);

            if (!paramsValues) {
                help(server, this);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.removeStockQtyByName(server, paramsValues.name, paramsValues.quantity, paramsValues.reason)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}