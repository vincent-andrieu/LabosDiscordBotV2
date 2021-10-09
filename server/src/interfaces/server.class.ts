import { Guild, TextChannel } from "discord.js";

import { CModel } from "@global/interfaces/database.interface";
import { IServer, IServerModel } from "@global/interfaces/server.interface";
import { ILaboratory } from "@global/interfaces/laboratory.interface";
import DiscordBot from "../init/bot";

export class CServer implements IServer {
    _id: string;
    guild: Guild | undefined;
    url?: string;
    name?: string;
    password: string;
    screen?: string;
    defaultLabo?: ILaboratory;
    defaultChannel: TextChannel | undefined;
    locationsChannel?: TextChannel | undefined;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        this._id = server._id;
        if (server._id) {
            this.guild = DiscordBot.getServerFromId(server._id.toString());
        }
        this.url = server.url;
        this.name = server.name || this.guild?.name;
        this.password = server.password || "password";
        this.screen = server.screen || this.guild?.iconURL() || undefined;
        if (typeof server.defaultLabo === 'object') {
            this.defaultLabo = server.defaultLabo;
        }
        if (typeof server.defaultChannel === 'string') {
            this.defaultChannel = DiscordBot.getChannelFromId(server.defaultChannel);
        } else {
            this.defaultChannel = server.defaultChannel;
        }
        if (typeof server.locationsChannel === 'string') {
            this.locationsChannel = DiscordBot.getChannelFromId(server.locationsChannel);
        } else {
            this.locationsChannel = server.locationsChannel || this.defaultChannel;
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