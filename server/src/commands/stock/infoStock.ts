import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CStock } from "@interfaces/stock.class";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";

export default class StockInfoStock extends CCommand<StockSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new StockSchema(), ECommand.STOCK_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stockName: string | undefined = this.getParamsTemplate(params);
            const getFunc = stockName ? this._schema.findByName(server, stockName, true) : this._schema.getByServer(server);

            getFunc
                .then((stocks) =>
                    this.sendStocksInfos(server, stocks, guildMember?.id)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendStocksInfos(server: CServer, stocks: Array<CStock>, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (stocks.length === 0) {
                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Aucun entrepôt n'a été créé", userId);
                return server.defaultChannel?.send(embedMessage)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (stocks.length === 1 ? "l'" : "les " + stocks.length + " ") + "entrepôt" + (stocks.length === 1 ? " " + stocks[0].name : "s"), userId);
            if (stocks.length === 1 && stocks[0].screen) {
                embedMessage.setImage(stocks[0].screen);
            }
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