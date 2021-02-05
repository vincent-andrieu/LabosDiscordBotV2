import { CServer } from "@global/interfaces/server.interface";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@commands/commands";

export default class SetUrl extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_URL, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url: string | undefined = this.getParamsTemplate(params);

            if (!url) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setUrl(server, url)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}