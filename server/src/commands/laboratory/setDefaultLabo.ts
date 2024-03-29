import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class LaboratorySetDefaultLabo extends CCommand<LaboratorySchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(socketService), ECommand.LABO_SET_DEFAULT, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);

            if (!name) {
                help(server, textChannel, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setDefaultLaboByName(server, name, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}