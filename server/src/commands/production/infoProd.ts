import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CProductions } from "@interfaces/production.class";
import { ProductionSchema } from "@schemas/productions.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";
import Sockets from "init/sockets";

export default class ProductionInfoProd extends CCommand<ProductionSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ProductionSchema(socketService), ECommand.PROD_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const laboName: string | undefined = this.getParamsTemplate(params);
            const getFunc = laboName ? this._schema.findByName(server, laboName, true) : this._schema.getByServer(server);

            getFunc
                .then((prods) =>
                    this.sendProdsInfos(server, prods, guildMember)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendProdsInfos(server: CServer, prods: Array<CProductions>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (prods.length === 0) {
                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Aucune production n'est en cours", guildMember?.id);
                return server.defaultChannel?.send(embedMessage)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (prods.length === 1 ? "la" : "les " + prods.length) + " production" + (prods.length === 1 ? "" : "s") + " en cours", guildMember?.id);
            let infoMsg = "";

            prods.forEach((prod: CProductions) => infoMsg += prod.getInfo(embedMessage));
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