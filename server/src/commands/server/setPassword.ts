import { ServerSchema } from "@schemas/servers.schema";
import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";

export default class ServerSetPassword extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_PASSWORD, helpDesc, helpParams);
    }

    private _getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const password: string | undefined = this._getParamsTemplate(params);

            if (!password) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setPassword(server, password)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}