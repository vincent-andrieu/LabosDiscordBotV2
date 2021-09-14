import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class LaboratoryAddLaboStock extends CCommand<LaboratorySchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(socketService), ECommand.LABO_ADD_STOCK, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): { laboName: string, stockName: string } | undefined {
        if (params.length < 2) {
            return undefined;
        }
        return { laboName: params[0], stockName: params[1] };
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const names: { laboName: string, stockName: string } | undefined = this.getParamsTemplate(params);

            if (!names) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.addLaboStockByNames(server, names.laboName, names.stockName, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}