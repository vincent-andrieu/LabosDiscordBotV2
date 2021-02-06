import { Client, Guild, Message, MessageEmbed, TextChannel } from "discord.js";
import { readFileSync } from "fs";

import { CServer } from "@interfaces/server.class";

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
            client.login(this.getBotToken());

            client.on('ready', () => {
                console.info("Bot ready !");
                if (!client.user) {
                    reject("Bot user is null");
                }
                // client.user?.setActivity(BotConfig.bot.activity);
                DiscordBot.client = client;
                resolve(client);
            });
        });
    }

    private getBotToken(): string {
        return readFileSync('./discord-bot-token', 'utf-8');
    }

    public static getChannelFromId(channelId: string): TextChannel | undefined {
        return this.client.channels.cache.get(channelId) as TextChannel;
    }

    public static getServerFromId(serverId: string): Guild | undefined {
        return this.client.guilds.cache.get(serverId);
    }

    public static getDefaultEmbedMsg(server: CServer, color: EEmbedMsgColors, title?: string): MessageEmbed {
        const embedMessage = new MessageEmbed()
            .setColor(color)
            .setTitle(title ? title : "")
            .setTimestamp();

        if (server.url) {
            embedMessage.setURL(server.url);
        }
        return embedMessage;
    }

    public static putError(channel: TextChannel, msg: string): Promise<Message> {
        return channel.send("```diff\nErreur : " + msg + "\n```");
    }
}