import { TextChannel } from "discord.js";

import { IModel } from "./database.interface";
import { ILaboratory } from "./laboratory.interface";

export interface IServer {
    _id: string;
    url?: string;
    name?: string;
    password?: string;
    screen?: string;
    defaultLabo?: ILaboratory | string;
    defaultChannel: TextChannel | undefined | string;
    locationsChannel?: TextChannel | undefined | string;
    reminder?: number;
    roleTag?: string;
}

export interface IServerModel extends IModel {
    server: IServer;
}