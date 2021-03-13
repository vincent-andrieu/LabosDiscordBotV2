import { TextChannel } from "discord.js";

import { CModel } from "@global/interfaces/database.interface";
import { ILaboratory } from "@global/interfaces/laboratory.interface";
import { IServer, IServerModel } from "@global/interfaces/server.interface";

export class CServer implements IServer {
    _id: string;
    url?: string;
    //activity: string;
    defaultLabo?: ILaboratory | string;
    defaultChannel: string;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        this._id = server._id;
        this.url = server.url;
        //this.activity = server.activity;
        this.defaultLabo = server.defaultLabo;
        this.defaultChannel = (server.defaultChannel as TextChannel | undefined)?.id || server.defaultChannel as string || "";
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