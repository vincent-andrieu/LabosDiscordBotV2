import { CServer } from "@interfaces/server.class";
import { CCommand, ECommand } from "@interfaces/command.class";
import { ServerSchema } from "@schemas/servers.schema";

export default class ServerSetReminder extends CCommand<ServerSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new ServerSchema(), ECommand.SERVER_SET_REMINDER, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): number | undefined {
        if (params.length == 0) {
            return undefined;
        }
        return Number(params[0]);
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const reminder: number | undefined = this.getParamsTemplate(params);

            if (!reminder) {
                return reject("Paramètres de la commande invalide");
            }
            this._schema.setReminder(server, reminder)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

}