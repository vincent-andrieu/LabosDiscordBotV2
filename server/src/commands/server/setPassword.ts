import { ServerSchema } from "@schemas/servers.schema";
import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";

export default class ServerSetPassword extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_PASSWORD, helpDesc, helpParams);
    }

    private _getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const password: string | undefined = this._getParamsTemplate(params);

            if (!password) {
                help(server, this, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setPassword(server, password, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}