import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";

export default class ServerSetRoleTag extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_ROLETAG, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return this.concatLastParams(params, 0);
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const roleTag: string | undefined = this.getParamsTemplate(params);

            this._schema.setRoleTag(server, roleTag, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}