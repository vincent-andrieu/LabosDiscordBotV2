import { GuildMember } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { CCommand, ECommand } from "@interfaces/command.class";
import { CLaboratory } from "@interfaces/laboratory.class";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";
import Sockets from "init/sockets";

export default class LaboratoryInfoLabo extends CCommand<LaboratorySchema> {

    constructor(socketService: Sockets, helpDesc = "", helpParams = "") {
        super(new LaboratorySchema(socketService), ECommand.LABO_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);
            const getFunc = name ? this._schema.findByName(server, name, true) : this._schema.getByServer(server);

            getFunc
                .then((labos) =>
                    this.sendLabosInfos(server, labos, guildMember)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendLabosInfos(server: CServer, labos: Array<CLaboratory>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (labos.length == 0) {
                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Aucun laboratoire n'a été créé", guildMember?.id);
                return server.defaultChannel?.send(embedMessage)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (labos.length === 1 ? "le" : "les " + labos.length) + " laboratoire" + (labos.length === 1 ? " " + labos[0].name : "s"), guildMember?.id);
            if (labos.length === 1 && labos[0].screen) {
                embedMessage.setImage(labos[0].screen);
            }
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