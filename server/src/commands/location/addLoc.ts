import { GuildMember } from "discord.js";
import moment from "moment";

import { CCommand, ECommand } from "@interfaces/command.class";
import { LocationSchema } from "@schemas/locations.schema";
import { CServer } from "@interfaces/server.class";
import { CLocation } from "@interfaces/location.class";
import { help } from "@commands/help/help";
import { serverConfig } from "../../server.config";
import Sockets from "init/sockets";

export default class LocationAddLoc extends CCommand<LocationSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LocationSchema(socketService), ECommand.LOC_ADD, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>, server: CServer, guildMember?: GuildMember | null): CLocation | undefined {
        if (params.length < 3) {
            return undefined;
        }
        return new CLocation({
            server: server,
            name: params[0],
            date: moment(params[1] + " " + params[2], serverConfig.commands.dateFormat).toDate(),
            screen: params[3],
            tag: this.concatLastParams(params, 4) || guildMember?.user.toString()
        });
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const location: CLocation | undefined = this.getParamsTemplate(params, server, guildMember);

            if (!location) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(location, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}