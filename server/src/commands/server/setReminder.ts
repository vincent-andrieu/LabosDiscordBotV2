import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";
import { ServerSchema } from "@schemas/servers.schema";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class ServerSetReminder extends CCommand<ServerSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ServerSchema(socketService), ECommand.SERVER_SET_REMINDER, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): number | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return Number(params[0]);
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const reminder: number | undefined = this.getParamsTemplate(params);

            if (reminder === undefined) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setReminder(server, reminder, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}