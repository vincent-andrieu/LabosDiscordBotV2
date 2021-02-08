import { CServer } from "@interfaces/server.class";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, ECommand } from "@interfaces/command.class";

export default class ServerSetRoleTag extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_ROLETAG, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const roleTag: string | undefined = this.getParamsTemplate(params);

            if (!roleTag) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setRoleTag(server, roleTag)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}