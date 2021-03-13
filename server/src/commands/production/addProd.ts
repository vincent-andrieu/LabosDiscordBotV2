import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CLaboratory } from "@interfaces/laboratory.class";
import { CProductions } from "@interfaces/production.class";
import { ProductionSchema } from "@schemas/productions.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { help } from "@commands/help/help";

export default class ProductionAddProd extends CCommand<ProductionSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ProductionSchema(), ECommand.PROD_ADD, helpDesc, helpParams);
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

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (params.length < 1) {
                help(server, this, guildMember?.id);
                return reject("Paramètres de la commande invalide");
            }
            this.getLabo(server, params[1])
                .then((labo: CLaboratory) => {
                    const prod: CProductions | undefined = this.getParamsTemplate(params, labo);

                    if (!prod) {
                        help(server, this, guildMember?.id);
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
        return new LaboratorySchema().findOneByName(server, laboName, true);
    }

}