import { GuildMember, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CLaboratory } from "@interfaces/laboratory.class";
import { CProductions } from "@interfaces/production.class";
import { ProductionSchema } from "@schemas/productions.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { help } from "@commands/help/help";
import Sockets from "init/sockets";

export default class ProductionAddProd extends CCommand<ProductionSchema> {

    constructor(private _socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new ProductionSchema(_socketService), ECommand.PROD_ADD, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>, labo: CLaboratory): CProductions | undefined {
        const quantity = Number(params[0]);

        if (!quantity) {
            return undefined;
        }
        return new CProductions({
            server: labo.server,
            labo: labo,
            quantity: quantity,
            description: this.concatLastParams(params, 2)
        });
    }

    public doAction(server: CServer, textChannel: TextChannel, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (params.length < 1) {
                help(server, textChannel, this, undefined, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this.getLabo(server, params[1])
                .then((labo: CLaboratory) => {
                    const prod: CProductions | undefined = this.getParamsTemplate(params, labo);

                    if (!prod) {
                        help(server, textChannel, this, undefined, guildMember?.id);
                        return reject("Paramètres de la commande invalide");
                    }
                    this._schema.add(prod, guildMember?.id)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
        });
    }

    private getLabo(server: CServer, laboName: string): Promise<CLaboratory> {
        if (server.defaultLabo) {
            return new Promise((resolve) => resolve(server.defaultLabo as CLaboratory));
        }
        return new LaboratorySchema(this._socketService).findOneByName(server, laboName, true);
    }

}