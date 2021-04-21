import { IServerModel } from "./server.interface";

export interface ILocation extends IServerModel {
    name: string;
    date: Date;
    screen?: string;
    reminders?: Array<Date>;
    tag?: string;
}