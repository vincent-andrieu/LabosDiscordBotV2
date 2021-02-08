import { CServer } from "@interfaces/server.class";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";

export default class StockAddStock extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_ADD, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { name: string, quantity: number, reason?: string } | undefined {
        const nbrQty = Number(params[1]);
        if (params.length < 2 || isNaN(nbrQty)) {
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
            this._schema.addStockQtyByName(server, paramsValues.name, paramsValues.quantity, paramsValues.reason)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}