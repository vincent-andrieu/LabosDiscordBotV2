import { Message, MessageEmbed, TextChannel } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import DiscordBot, { EEmbedMsgColors } from "init/bot";

import SetDefaultChannel from "./server/setDefaultChannel";
import SetUrl from "./server/setUrl";
import SetReminder from "./server/setReminder";
import SetRoleTag from "./server/setRoleTag";
import SetDefaultLabo from "./laboratory/setDefaultLabo";

class LaboratoryCmds {
    public static SetDefaultLabo = new SetDefaultLabo("Modifier le laboratoire par défaut", "**Nom**");
}

class ProductionCmds {}

class StockCmds {}

class ServerCmds {
    public static SetDefaultChannel = new SetDefaultChannel("Modifier le channel par défaut");
    public static SetUrl = new SetUrl("Modifier l'URL du site", "**URL**");
    public static SetReminder = new SetReminder("Modifier le rappel d'une production", "**Minutes**");
    public static SetRoleTag = new SetRoleTag("Modifier le rôle qui gère les laboratoires", "**Tag du rôle**");
}

export const CommandsList: Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema>> = [
    LaboratoryCmds.SetDefaultLabo,

    ServerCmds.SetDefaultChannel,
    ServerCmds.SetUrl,
    ServerCmds.SetReminder,
    ServerCmds.SetRoleTag
];

export enum ECommand {
    LABO_SET_DEFAULT = 'setDefaultLabo',
    LABO_ADD = 'addLabo',
    LABO_DEL = 'delLabo',
    LABO_INFO = 'infoLabo',
    LABO_ADD_STOCK = 'addLaboStock',
    LABO_DEL_STOCK = 'delLaboStock',

    PROD_ADD = 'addProd',
    PROD_DEL = 'delProd',
    PROD_SET = 'setProd',
    PROD_INFO = 'infoProd',

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