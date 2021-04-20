import { GuildMember } from "discord.js";

import { CCommand, ECommand } from "@interfaces/command.class";
import { CServer } from "@interfaces/server.class";
import { CLocation } from "@interfaces/location.class";
import { LocationSchema } from "@schemas/locations.schema";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";

export default class LocationInfoLoc extends CCommand<LocationSchema> {

    constructor(helpDesc = "", helpParams = "") {
        super(new LocationSchema(), ECommand.LOC_INFO, helpDesc, helpParams);
    }

    private getParamsTemplate(params: Array<string>): string | undefined {
        return params[0];
    }

    public doAction(server: CServer, params: Array<string>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const name: string | undefined = this.getParamsTemplate(params);
            const getFunc = name ? this._schema.findByName(server, name, true) : this._schema.getByServer(server);

            getFunc
                .then((locs) =>
                    this.sendLocationsInfos(server, locs, guildMember)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err));
        });
    }

    private sendLocationsInfos(server: CServer, locations: Array<CLocation>, guildMember?: GuildMember | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (locations.length == 0) {
                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Aucune location n'a été ajoutée", guildMember?.id);
                return server.defaultChannel?.send(embedMessage)
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
            const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.INFO, "Information sur " + (locations.length === 1 ? "la" : "les " + locations.length) + " location" + (locations.length === 1 ? "" : "s"), guildMember?.id);
            if (locations.length === 1 && locations[0].screen) {
                embedMessage.setImage(locations[0].screen);
            }
            let infoMsg = "";

            locations.forEach((loc: CLocation) => infoMsg += loc.getInfo(embedMessage));
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