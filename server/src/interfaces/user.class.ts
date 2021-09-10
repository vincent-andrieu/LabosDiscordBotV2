import { DiscordUser } from "@global/interfaces/discord.interface";
import { ERole, IUser } from "@global/interfaces/user.interface";
import DiscordBot from "../init/bot";

export class CUser implements IUser {
    _id: string;
    discordUser: DiscordUser | undefined;
    role: ERole;

    constructor(user: IUser) {
        this._id = user._id;
        if (user && typeof user === 'string') {
            this.discordUser = DiscordBot.getDiscordUserFromId(user);
        } else if (user && (user as CUser).discordUser) {
            this.discordUser = (user as CUser).discordUser;
        } else if (user._id) {
            this.discordUser = DiscordBot.getDiscordUserFromId(user._id);
        }
        this.role = user.role;
    }
}