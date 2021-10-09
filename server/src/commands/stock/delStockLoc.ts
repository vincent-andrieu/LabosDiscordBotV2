import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class StockDelStockLoc extends CCommand<StockSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new StockSchema(socketService), ECommand.STOCK_DEL_LOC, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { name: string, reason?: string } | undefined {
        if (params.length < 1) {
            return undefined;
        }
        return {
            name: params[0],
            reason: this.concatLastParams(params, 1)
        };
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const paramsValues: { name: string, reason?: string } | undefined = this.getParamsTemplate(params);

            if (!paramsValues) {
                help(server, textChannel, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.deleteByName(server, paramsValues.name, paramsValues.reason, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}