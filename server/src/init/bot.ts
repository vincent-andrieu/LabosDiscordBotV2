import { Client } from "discord.js";
import { readFileSync } from "fs";

export default class DiscordBot {

    public connect(): Promise<Client> {
        return new Promise<Client>((resolve, reject) => {
            const client: Client = new Client;

            client.on('error', console.error);
            client.on('warn', console.warn);
            client.login(this.getBotToken());
            console.log(this.getBotToken());

            client.on('ready', () => {
                console.info("Bot ready !");
                if (!client.user) {
                    reject("Bot user is null");
                }
                // client.user?.setActivity(BotConfig.bot.activity);
                resolve(client);
            });
        });
    }

    private getBotToken(): string {
        return readFileSync('./discord-bot-token', 'utf-8');
    }
}