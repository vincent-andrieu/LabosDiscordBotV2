import { CModel } from "@global/interfaces/database.interface";
import { DiscordUser } from "@global/interfaces/discord.interface";
import { ERole, IUser } from "@global/interfaces/user.interface";
import DiscordBot from "../init/bot";

export class CUser extends CModel implements IUser {
    discordUser: DiscordUser | undefined;
    role: ERole;

    constructor(user: IUser) {
        super(user);

        if (user && typeof user === 'string') {
            this.discordUser = DiscordBot.getDiscordUserFromId(user);
        } else {
            this.discordUser = user.discordUser as DiscordUser;
        }
        this.role = user.role;
    }
}