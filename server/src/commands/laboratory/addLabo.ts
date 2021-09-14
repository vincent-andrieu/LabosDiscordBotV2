import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CLaboratory } from "@interfaces/laboratory.class";
import { EDrugsList } from "@global/interfaces/drug-stuff.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class LaboratoryAddLabo extends CCommand<LaboratorySchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(socketService), ECommand.LABO_ADD, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>, server: CServer): CLaboratory | undefined {
        if (params.length < 2) {
            return undefined;
        }
        return new CLaboratory({
            server: server,
            name: params[0],
            drug: params[1] as EDrugsList,
            screen: params[2]
        });
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const labo: CLaboratory | undefined = this.getParamsTemplate(params, server);

            if (!labo) {
                help(server, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(labo, guildMember?.id)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}