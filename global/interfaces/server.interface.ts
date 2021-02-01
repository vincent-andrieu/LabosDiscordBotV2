import { IModel, CModel } from "./database.interface";

export interface IServer extends IModel {
    name: string;
    botName: string;
    activity: string;
}

export class CServer extends CModel implements IServer {
    name: string;
    botName: string;
    activity: string;

    constructor(server: IServer) {
        super(server);

        this.name = server.name;
        this.botName = server.botName;
        this.activity = server.activity;
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