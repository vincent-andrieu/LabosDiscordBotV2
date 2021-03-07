import { CModel } from "@global/interfaces/database.interface";
import { IServer, IServerModel } from "@global/interfaces/server.interface";
import { CLaboratory } from "./laboratory.class";

export class CServer implements IServer {
    _id: string;
    url?: string;
    //activity: string;
    defaultLabo?: CLaboratory;
    defaultChannel: string;
    reminder?: number;
    roleTag?: string;

    constructor(server: IServer) {
        this._id = server._id;
        this.url = server.url;
        //this.activity = server.activity;
        if (typeof server.defaultLabo === 'object') {
            this.defaultLabo = new CLaboratory(server.defaultLabo);
        }
        this.defaultChannel = server.defaultChannel;
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