import { Message, MessageEmbed, TextChannel } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import DiscordBot, { EEmbedMsgColors } from "init/bot";

import SetDefaultChannel from "./server/setDefaultChannel";

class LaboratoryCmds {}

class ProductionCmds {}

class StockCmds {}

class ServerCmds {
    public static SetDefaultChannel = new SetDefaultChannel("Modifier le channel par défaut");
}

export const CommandsList: Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema>> = [
    ServerCmds.SetDefaultChannel
];

export enum ECommand {
    LABO_SET_DEFAULT = 'setDefaultLabo',
    LABO_ADD = 'addLabo',
    LABO_DEL = 'delLabo',
    LABO_INFO = 'infoLabo',
    LABO_ADD_STOCK = 'addLaboStock',
    LABO_DEL_STOCK = 'delLaboStock',

    STOCK_ADD_LOC = 'addStockLoc',
    STOCK_DEL_LOC = 'delStockLoc',
    STOCK_ADD = 'addStock',
    STOCK_DEL = 'delStock',
    STOCK_SET = 'setStock',
    STOCK_INFO = 'infoStock',

    SERVER_SET_DEFAULT_CHANNEL = 'setDefaultChannel',
    SERVER_SET_URL = 'setURL',
    SERVER_SET_REMINDER = 'setReminder',
    SERVER_SET_ROLETAG = 'setRole'
}

export abstract class CCommand<T> {
    private _help: { description: string, params: string };

    constructor(
        protected _schema: T,
        public name: ECommand,
        helpDesc = "",
        helpParams = "")
    {
        this._help = {
            description: helpDesc,
            params: helpParams
        };
    }

    public abstract doAction(server: CServer, params?: Array<string>, textChannel?: TextChannel): Promise<void>;

    public getHelp(embedMessage?: MessageEmbed): string {
        if (embedMessage) {
            embedMessage.addField("**" + this.name + "**", this._help.description + (this._help.params ? " *(" + this._help.params + ")*" : ""), true);
        }
        return this._help.description.concat(" *(", this._help.params, ")*");
    }

    public sendHelp(server: CServer): Promise<Message> | undefined {
        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP);

        return server.defaultChannel?.send(this.getHelp(embedMessage));
    }

}