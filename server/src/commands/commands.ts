import { Message, MessageEmbed, TextChannel } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import DiscordBot, { EEmbedMsgColors } from "init/bot";

import LaboratorySetDefaultLabo from "./laboratory/setDefaultLabo";
import LaboratoryAddLabo from "./laboratory/addLabo";
import LaboratoryDelLabo from "./laboratory/delLabo";
import LaboratoryInfoLabo from "./laboratory/infoLabo";
import LaboratoryAddLaboStock from "./laboratory/addLaboStock";
import LaboratoryDelLaboStock from "./laboratory/delLaboStock";
import ProductionAddProd from "./production/addProd";
import ProductionDelProd from "./production/delProd";
import ProductionInfoProd from "./production/infoProd";
import StockAddStockLoc from "./stock/addStockLoc";
import ServerSetDefaultChannel from "./server/setDefaultChannel";
import ServerSetUrl from "./server/setUrl";
import ServerSetReminder from "./server/setReminder";
import ServerSetRoleTag from "./server/setRoleTag";
import StockDelStockLoc from "./stock/delStockLoc";
import StockAddStock from "./stock/addStock";
import StockDelStock from "./stock/delStock";
import StockSetStock from "./stock/setStock";

export const CommandsList: Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema>> = [
    new LaboratorySetDefaultLabo("Modifier le laboratoire par défaut", "**Nom**"),
    new LaboratoryAddLabo("Ajoute un laboratoire", "**Nom**, **Drogue**, Lien"),
    new LaboratoryDelLabo("Supprime un laboratoire", "**Nom**"),
    new LaboratoryInfoLabo("Affiche la liste des laboratoire", "Nom"),
    new LaboratoryAddLaboStock("Ajoute un entrepôt à un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),
    new LaboratoryDelLaboStock("Supprime un entrepôt d'un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),

    new ProductionAddProd("Ajoute une production", "**Quantité**, Laboratoire, Description"),
    new ProductionDelProd("Supprime toute les productions d'un laboratoire", "Laboratoire, Raison"),
    new ProductionInfoProd("Affiche la liste des productions en cours", "Nom du laboratoire"),

    new StockAddStockLoc("Ajoute un entrepôt", "**Nom**, **Drogue**, Lien"),
    new StockDelStockLoc("Supprime un entrepôt", "**Nom**"),
    new StockAddStock("Ajoute de la marchandise dans un entrepôt", "**Nom**, **Quantité**"),
    new StockDelStock("Supprime de la marchandise dans un entrepôt", "**Nom**, **Quantité**"),
    new StockSetStock("Modifie la marchandise d'un entrepôt", "**Nom**, **Quantité**"),

    new ServerSetDefaultChannel("Modifier le channel par défaut"),
    new ServerSetUrl("Modifier l'URL du site", "**URL**"),
    new ServerSetReminder("Modifier le rappel d'une production", "**Minutes**"),
    new ServerSetRoleTag("Modifier le rôle qui gère les laboratoires", "**Tag du rôle**")
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