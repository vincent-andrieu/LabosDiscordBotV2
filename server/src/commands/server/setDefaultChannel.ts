import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import Sockets from "init/sockets";

export default class ServerSetDefaultChannel extends CCommand<ServerSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ServerSchema(socketService), ECommand.SERVER_SET_DEFAULT_CHANNEL, helpDesc, helpParams);
    }

    public doAction(server: CServer, textChannel: TextChannel, _: Array<string>, guildMember: GuildMember | null): Promise<void> {
        return this._schema.setDefaultChannel(server, textChannel, guildMember?.id);
    }

}