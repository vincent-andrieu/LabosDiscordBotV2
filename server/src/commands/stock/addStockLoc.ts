import { CServer } from "@global/interfaces/server.interface";
import { CStock } from "@global/interfaces/stock.interface";
import { EDrugsList, EStuffList } from "@global/interfaces/drug-stuff.interface";
import { isADrugOrStuff } from "@global/utils";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class StockAddStockLoc extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_ADD_LOC, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>, server: CServer): CStock | undefined {
        if (params.length < 2) {
            return undefined;
        }
        return new CStock({
            server: server,
            name: params[0],
            drug: params[1] as EDrugsList | EStuffList,
            screen: params[2]
        });
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stock: CStock | undefined = this.getParamsTemplate(params, server);

            if (!stock) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(stock)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}