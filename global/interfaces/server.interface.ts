import { IModel, Model } from "./database.interface";

export interface IServer extends IModel {
    name: string;
    botName: string;
    activity: string;
}

export class CServer extends Model {
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