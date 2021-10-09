import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import Sockets from "init/sockets";

export default class ServerSetRoleTag extends CCommand<ServerSchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ServerSchema(socketService), ECommand.SERVER_SET_ROLETAG, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return this.concatLastParams(params, 0);
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const roleTag: string | undefined = this.getParamsTemplate(params);

            this._schema.setRoleTag(server, roleTag, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}