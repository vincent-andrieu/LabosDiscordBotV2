import { CServer } from "@global/interfaces/server.interface";
import { CLaboratory } from "@global/interfaces/laboratory.interface";
import { EDrugsList } from "@global/interfaces/drug-stuff.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class LaboratoryAddLabo extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_ADD, helpDesc, helpParams);
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

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const labo: CLaboratory | undefined = this.getParamsTemplate(params, server);

            if (!labo) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.add(labo)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}