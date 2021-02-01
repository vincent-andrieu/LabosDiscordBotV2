import { Client, Message } from "discord.js";
import { exit, pid } from "process";
import 'module-alias/register';

import { EXIT_ERROR } from "@global/utils";
import DiscordBot from "./init/bot";
import DataBase from "./init/database";

const discordBot = new DiscordBot();
const database = new DataBase();

discordBot.connect().then((client: Client) => {
    startBot(client);
}).catch((err) => {
    console.error(err);
    exit(EXIT_ERROR);
});

database.connect().catch((err) => {
    console.error(err);
    exit(EXIT_ERROR);
});

console.info("PID : " + pid);

function startBot(client: Client) {
    client.on('message', (message: Message) => {
        console.log("Message");
    });
}