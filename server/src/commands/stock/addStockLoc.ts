import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CStock } from "@interfaces/stock.class";
import { EDrugsList, EStuffList } from "@global/interfaces/drug-stuff.interface";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class StockAddStockLoc extends CCommand<StockSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new StockSchema(socketService), ECommand.STOCK_ADD_LOC, helpDesc, helpParams);
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

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const stock: CStock | undefined = this.getParamsTemplate(params, server);

            if (!stock) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(stock, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}