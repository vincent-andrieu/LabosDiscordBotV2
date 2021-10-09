import { TextChannel } from "discord.js";

import { CModel } from "@global/interfaces/database.interface";
import { ILaboratory } from "@global/interfaces/laboratory.interface";
import { IServer, IServerModel } from "@global/interfaces/server.interface";

export class CServer implements IServer {
    _id: string;
    url?: string;
    name?: string;
    password: string;
    screen?: string;
    defaultLabo?: ILaboratory | string;
    defaultChannel: string;
    locationsChannel?: string;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        this._id = server._id;
        this.url = server.url;
        this.name = server.name;
        this.password = server.password || "password";
        this.screen = server.screen;
        this.defaultLabo = server.defaultLabo;
        this.defaultChannel = (server.defaultChannel as TextChannel | undefined)?.id || server.defaultChannel as string || "";
        this.locationsChannel = (server.locationsChannel as TextChannel | undefined)?.id || server.locationsChannel as string || this.defaultChannel;
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