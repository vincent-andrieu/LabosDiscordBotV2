import { GuildMember } from "discord.js";
import moment from "moment";

import { CCommand, ECommand } from "@interfaces/command.class";
import { LocationSchema } from "@schemas/locations.schema";
import { CServer } from "@interfaces/server.class";
import { CLocation } from "@interfaces/location.class";
import { help } from "@commands/help/help";
import { serverConfig } from "../../server.config";

export default class LocationAddLoc extends CCommand<LocationSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LocationSchema(), ECommand.LOC_ADD, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>, server: CServer): CLocation | undefined {
        if (params.length < 3) {
            return undefined;
        }
        return new CLocation({
            server: server,
            name: params[0],
            date: moment(params[1] + " " + params[2], serverConfig.commands.dateFormat).toDate(),
            screen: params[3]
        });
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const location: CLocation | undefined = this.getParamsTemplate(params, server);

            if (!location) {
                help(server, this, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(location, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}