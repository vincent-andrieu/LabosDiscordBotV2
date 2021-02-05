import { CServer } from "@global/interfaces/server.interface";
import { CCommand, ECommand } from "@commands/commands";
import { LaboratorySchema } from "@schemas/laboratories.schema";

export default class SetDefaultLabo extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_SET_DEFAULT, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);

            if (!name) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setDefaultLaboByName(server, name)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}