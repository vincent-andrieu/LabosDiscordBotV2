import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import Sockets from "init/sockets";

export default class ServerSetLocationsChannel extends CCommand<ServerSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ServerSchema(socketService), ECommand.SERVER_SET_LOCATIONS_CHANNEL, helpDesc, helpParams);
    }

    public doAction(server: CServer, _: Array<string>, guildMember: GuildMember | null, textChannel: TextChannel): Promise<void> {
        return this._schema.setLocationsChannel(server, textChannel, guildMember?.id);
    }

}