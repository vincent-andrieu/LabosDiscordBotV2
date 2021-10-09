import { GuildMember, TextChannel } from "discord.js";

import { CCommand, ECommand } from "@interfaces/command.class";
import { LocationSchema } from "@schemas/locations.schema";
import { CServer } from "@interfaces/server.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class LocationSetTag extends CCommand<LocationSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LocationSchema(socketService), ECommand.LOC_SET_TAG, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): {
        name: string,
        tag: string
    } | undefined {
        if (params.length < 2) {
            return undefined;
        }
        return {
            name: params[0],
            tag: this.concatLastParams(params, 1)
        };
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const values: {
                name: string,
                tag: string
            } | undefined = this.getParamsTemplate(params);

            if (!values) {
                help(server, textChannel, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setTagByName(server, values.name, values.tag, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}