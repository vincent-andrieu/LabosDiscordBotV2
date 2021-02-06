import { TextChannel } from "discord.js";

import { IModel } from "./database.interface";
import { ILaboratory } from "./laboratory.interface";

export interface IServer extends IModel {
    url?: string;
    //activity: string;
    defaultLabo?: ILaboratory | string;
    defaultChannel: TextChannel | undefined | string;
    reminder?: number;
    roleTag?: string;
}

export interface IServerModel extends IModel {
    server: IServer;
}