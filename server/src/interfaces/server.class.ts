import { Guild, TextChannel } from "discord.js";

import { CModel } from "@global/interfaces/database.interface";
import { IServer, IServerModel } from "@global/interfaces/server.interface";
import { ILaboratory } from "@global/interfaces/laboratory.interface";
import DiscordBot from "../init/bot";

export class CServer implements IServer {
    _id: string;
    guild: Guild | undefined;
    url?: string;
    //activity: string;
    defaultLabo?: ILaboratory;
    defaultChannel: TextChannel | undefined;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        this._id = server._id;
        if (server._id) {
            this.guild = DiscordBot.getServerFromId(server._id.toString());
        }
        this.url = server.url;
        //this.activity = server.activity;
        if (typeof server.defaultLabo === 'object') {
            this.defaultLabo = server.defaultLabo;
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

export abstract class CServerModel extends CModel implements IServerModel {
    server: CServer;

    constructor(server: IServerModel) {
        super(server);

        this.server = new CServer(server.server);
    }
}