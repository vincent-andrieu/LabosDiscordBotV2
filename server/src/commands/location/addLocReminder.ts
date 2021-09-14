import { GuildMember } from "discord.js";
import moment from "moment";

import { CCommand, ECommand } from "@interfaces/command.class";
import { CServer } from "@interfaces/server.class";
import { LocationSchema } from "@schemas/locations.schema";
import { help } from "@commands/help/help";
import { serverConfig } from "../../server.config";
import Sockets from "init/sockets";

export default class LocationAddReminder extends CCommand<LocationSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LocationSchema(socketService), ECommand.LOC_ADD_REMINDER, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): {
        name: string,
        reminder: Date
    } | undefined {
        if (params.length < 3) {
            return undefined;
        }
        return {
            name: params[0],
            reminder: moment(params[1] + " " + params[2], serverConfig.commands.dateFormat).toDate()
        };
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const values: {
                name: string,
                reminder: Date
            } | undefined = this.getParamsTemplate(params);

            if (!values) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.addReminderByName(server, values.name, values.reminder, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}