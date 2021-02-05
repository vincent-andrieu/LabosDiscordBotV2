import { TextChannel } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class SetDefaultChannel extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_DEFAULT_CHANNEL, helpDesc, helpParams);
    }

    public doAction(server: CServer, _: Array<string>, textChannel: TextChannel): Promise<void> {
        return this._schema.setDefaultChannel(server, textChannel);
    }

}