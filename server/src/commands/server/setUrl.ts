import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";

export default class ServerSetUrl extends CCommand<ServerSchema> {

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
            if (!url.startsWith("http") && !url.startsWith("https")) {
                return reject("L'URL doit commencer par http ou https");
            }
            this._schema.setUrl(server, url)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}