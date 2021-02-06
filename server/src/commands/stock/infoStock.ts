import { CServer } from "@global/interfaces/server.interface";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@commands/commands";
import DiscordBot, { EEmbedMsgColors } from "init/bot";
import { CStock } from "@global/interfaces/stock.interface";

export default class StockInfoStock extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stockName: string | undefined = this.getParamsTemplate(params);
            const getFunc = stockName ? this._schema.findByName(server, stockName, true) : this._schema.getByServer(server);

            getFunc
                .then((stocks) =>
                    this.sendStocksInfos(server, stocks)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendStocksInfos(server: CServer, stocks: Array<CStock>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (stocks.length === 1 ? "l'" : "les " + stocks.length) + " entrepôt" + (stocks.length === 1 ? "" : "s"));
            let infoMsg = "";

            stocks.forEach((stock: CStock) => infoMsg += stock.getInfo(embedMessage));
            server.defaultChannel?.send(embedMessage)
                .then(() => resolve())
                .catch(() =>
                    server.defaultChannel?.send(infoMsg)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                );
        });
    }

}