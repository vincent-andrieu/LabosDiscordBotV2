import { CServer } from "@interfaces/server.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { CLaboratory } from "@interfaces/laboratory.class";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";

export default class LaboratoryInfoLabo extends CCommand<LaboratorySchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(), ECommand.LABO_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);
            const getFunc = name ? this._schema.findByName(server, name, true) : this._schema.getByServer(server);

            getFunc
                .then((labos) =>
                    this.sendLabosInfos(server, labos)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendLabosInfos(server: CServer, labos: Array<CLaboratory>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (labos.length === 1 ? "le" : "les " + labos.length) + " laboratoire" + (labos.length === 1 ? "" : "s"));
            let infoMsg = "";

            labos.forEach((labo: CLaboratory) => infoMsg += labo.getInfo(embedMessage));
            server.defaultChannel?.send(embedMessage)
                .then(() => resolve())
                .catch(() =>
                    server.defaultChannel?.send(infoMsg)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                );
        });
    }

}