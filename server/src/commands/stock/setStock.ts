import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { StockSchema } from "@schemas/stocks.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class StockSetStock extends CCommand<StockSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new StockSchema(socketService), ECommand.STOCK_SET, helpDesc, helpParams);
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

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const paramsValues: { name: string, quantity: number, reason?: string } | undefined = this.getParamsTemplate(params);

            if (!paramsValues) {
                help(server, textChannel, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setStockQtyByName(server, paramsValues.name, paramsValues.quantity, paramsValues.reason, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}