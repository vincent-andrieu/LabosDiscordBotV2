import { GuildMember, Message, MessageEmbed, TextChannel } from "discord.js";

import { CServer } from "./server.class";
import DiscordBot, { EEmbedMsgColors } from "../init/bot";

export enum ECommand {
    LABO_SET_DEFAULT = 'setDefaultLabo',
    LABO_ADD = 'addLabo',
    LABO_DEL = 'delLabo',
    LABO_INFO = 'infoLabo',
    LABO_ADD_STOCK = 'addLaboStock',
    LABO_DEL_STOCK = 'delLaboStock',

    PROD_ADD = 'addProd',
    PROD_DEL = 'delProd',
    PROD_INFO = 'infoProd',

    STOCK_ADD_LOC = 'addStockLoc',
    STOCK_DEL_LOC = 'delStockLoc',
    STOCK_ADD = 'addStock',
    STOCK_DEL = 'delStock',
    STOCK_SET = 'setStock',
    STOCK_INFO = 'infoStock',

    SERVER_SET_DEFAULT_CHANNEL = 'setDefaultChannel',
    SERVER_SET_URL = 'setURL',
    SERVER_SET_PASSWORD = 'setPassword',
    SERVER_SET_REMINDER = 'setReminder',
    SERVER_SET_ROLETAG = 'setRole',

    LOC_ADD = 'addLoc',
    LOC_DEL = 'delLoc',
    LOC_INFO = 'infoLoc'
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

    public abstract doAction(server: CServer, params?: Array<string>, guildMember?: GuildMember | null, textChannel?: TextChannel): Promise<void>;

    public getHelp(embedMessage?: MessageEmbed): string {
        if (embedMessage) {
            embedMessage.addField("**" + this.name + "**", this._help.description + (this._help.params ? " *(" + this._help.params + ")*" : ""), true);
        }
        return this._help.description.concat(" *(", this._help.params, ")*");
    }

    public sendHelp(server: CServer, userId?: string): Promise<Message | undefined> | undefined {
        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP, undefined, userId);
        const strMsg = this.getHelp(embedMessage);

        return server.defaultChannel?.send(embedMessage).catch(() =>
            server.defaultChannel?.send(strMsg)
        );
    }

    protected concatLastParams(params: Array<string>, atIndex: number): string {
        if (params.length > atIndex) {
            params.splice(0, atIndex);
            return params.join(' ');
        }
        return "";
    }

}