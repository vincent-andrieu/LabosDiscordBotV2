import { GuildMember } from "discord.js";

import { CCommand, ECommand } from "@interfaces/command.class";
import { CServer } from "@interfaces/server.class";
import { LocationSchema } from "@schemas/locations.schema";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class LocationDelLoc extends CCommand<LocationSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LocationSchema(socketService), ECommand.LOC_DEL, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { name: string, reason: string } | undefined {
        if (params.length < 1) {
            return undefined;
        }
        return {
            name: params[0],
            reason: this.concatLastParams(params, 1)
        };
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const values: {
                name: string,
                reason: string
            } | undefined = this.getParamsTemplate(params);

            if (!values) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.deleteByName(server, values.name, values.reason, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}