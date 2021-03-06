import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";

export default class LaboratoryDelLabo extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_DEL, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { laboName: string, reason?: string } | undefined {
        if (params.length < 1) {
            return undefined;
        }
        return {
            laboName: params[0],
            reason: this.concatLastParams(params, 1)
        };
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const values: { laboName: string, reason?: string } | undefined = this.getParamsTemplate(params);

            if (!values) {
                help(server, this, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.deleteByName(server, values.laboName, values.reason, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}