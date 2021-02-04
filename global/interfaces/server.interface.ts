import { Guild, TextChannel } from "discord.js";
import DiscordBot from "init/bot";

import { IModel, CModel } from "./database.interface";
import { CLaboratory, ILaboratory } from "./laboratory.interface";

export interface IServer extends IModel {
    url?: string;
    //activity: string;
    defaultLabo?: ILaboratory | string;
    defaultChannel: TextChannel | undefined | string;
    reminder?: number;
    roleTag?: string;
}

export class CServer extends CModel implements IServer {
    guild: Guild | undefined;
    url?: string;
    //activity: string;
    defaultLabo?: CLaboratory;
    defaultChannel: TextChannel | undefined;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        super(server);

        if (server._id) {
            this.guild = DiscordBot.getServerFromId(server._id.toString());
        }
        this.url = server.url;
        //this.activity = server.activity;
        if (typeof server.defaultLabo === 'object') {
            this.defaultLabo = new CLaboratory(server.defaultLabo);
        }
        if (typeof server.defaultChannel === 'string') {
            this.defaultChannel = DiscordBot.getChannelFromId(server.defaultChannel);
        } else {
            this.defaultChannel = server.defaultChannel;
        }
        this.reminder = server.reminder;
        this.roleTag = server.roleTag;
    }
}

export interface IServerModel extends IModel {
    server: IServer;
}

export class CServerModel extends CModel implements IServerModel {
    server: CServer;

    constructor(server: IServerModel) {
        super(server);

        this.server = new CServer(server.server);
    }
}