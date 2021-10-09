import { Client, Guild, GuildMember, Message, MessageEmbed, TextChannel } from "discord.js";
import { env } from 'process';
import { readFileSync } from "fs";

import { CServer } from "@interfaces/server.class";
import { serverConfig } from "../server.config";
import { DiscordUser } from "@global/interfaces/discord.interface";

export enum EEmbedMsgColors {
    ADD = '#00ff00',
    EDIT = '#ff9900',
    DEL = '#ff0000',
    INFO = '#0099ff',
    HELP = '#0000ff'
}

export default class DiscordBot {
    public static client: Client;

    public connect(): Promise<Client> {
        return new Promise<Client>((resolve, reject) => {
            const client: Client = new Client;

            client.on('error', console.error);
            client.on('warn', console.warn);
            client.login(this._getBotToken());

            client.on('ready', () => {
                console.info("Bot ready !");
                if (!client.user) {
                    reject("Bot user is null");
                }
                DiscordBot.client = client;
                resolve(client);
            });
        });
    }

    private _getBotToken(): string {
        return env[serverConfig.bot.token.env] ||  readFileSync(serverConfig.bot.token.file, 'utf-8');
    }

    public static getChannelFromId(channelId: string): TextChannel | undefined {
        return this.client.channels.cache.get(channelId) as TextChannel;
    }

    public static getServerFromId(serverId: string): Guild | undefined {
        return this.client.guilds.cache.get(serverId);
    }

    public static getMemberFromGuild(guild: Guild, memberId: string): GuildMember | undefined {
        return guild.members.cache.get(memberId);
    }

    public static getDiscordUserFromId(userId: string): DiscordUser | undefined {
        const user = this.client.users.cache.get(userId);

        if (!user) {
            return undefined;
        }
        return {
            id: user.id,
            name: user.username,
            avatar: user.displayAvatarURL()
        };
    }

    public static getGuildUsernameFromId(guild: Guild | undefined, userId: string): string {
        if (!guild) {
            return this.client.users.cache.get(userId)?.username || "";
        }
        const guildMember = guild.members.cache.get(userId);
        return guildMember?.displayName || "";
    }

    public static getUserAvatarFromId(userId: string): string {
        return this.client.users.cache.get(userId)?.displayAvatarURL() || "";
    }

    public static getDefaultEmbedMsg(server: CServer, color: EEmbedMsgColors, title?: string, authorId?: string): MessageEmbed {
        const embedMessage = new MessageEmbed()
            .setColor(color)
            .setTitle(title ? title : "")
            .setTimestamp();

        if (server.url) {
            embedMessage.setURL(`${server.url}/${server._id}/${server.password}`);
        }
        if (authorId) {
            embedMessage.setAuthor(this.getGuildUsernameFromId(server.guild, authorId), this.getUserAvatarFromId(authorId) || server.guild?.icon || '');
        }
        return embedMessage;
    }

    public static putError(channel: TextChannel, msg: string, userId?: string): Promise<Message> {
        if (!channel) {
            return Promise.reject(msg);
        }

        return channel.send((userId ? "<@" + userId + ">\n" : "") + "```diff\n- Erreur : " + msg + "\n```");
    }

    public static async leaveGuild(server: CServer): Promise<Guild> {
        const guild = await this.client.guilds.fetch(server._id);

        return guild.leave();
    }
}