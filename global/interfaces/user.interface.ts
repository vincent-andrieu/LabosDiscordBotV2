import { IModel } from "./database.interface";
import { DiscordUser } from "./discord.interface";

export interface IUser extends IModel {
    discordUser: DiscordUser | string | undefined;
    role: ERole;
}

export enum ERole {
    ADMIN = 'admin',
    USER = 'user'
}