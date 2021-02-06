import { Client, Message, TextChannel } from "discord.js";
import { exit, pid } from "process";
import 'module-alias/register';

import { EXIT_ERROR } from "@global/utils";
import { ObjectId } from "@global/interfaces/database.interface";
import { CServer } from "@global/interfaces/server.interface";
import { ProductionSchema } from "@schemas/productions.schema";
import { ServerSchema } from "@schemas/servers.schema";
import DiscordBot from "./init/bot";
import DataBase from "./init/database";
import { GlobalConfig } from "@global/config";
import { CommandsList } from "@commands/commands";
import { help } from "@commands/help/help";

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
        if (message.author.id === client.user?.id || !message.content.startsWith(GlobalConfig.commands.prefix)) {
            return;
        }
        const serverId = message.guild?.id;
        if (!serverId) {
            message.reply("Undefined server").catch((err) => console.error(err));
        }

        const msgElems: Array<string> = message.content.substr(1).split(" ");
        new ServerSchema().getById(new ObjectId(serverId as string))
            .then((server: CServer) => {
                if (msgElems[0] === "help") {
                    return help(server);
                }
                const cmdFunc = CommandsList.find((cmd) => cmd.name === msgElems[0]);
                if (cmdFunc) {
                    cmdFunc.doAction(server, msgElems, message.channel as TextChannel).catch((err) => {
                        if (typeof err === 'string') {
                            DiscordBot.putError(server.defaultChannel || message.channel as TextChannel, err)
                                .catch(() => console.error(err));
                        } else {
                            console.error(err);
                        }
                    });
                }
            })
            .catch((err) => console.error(err));
    });

    client.on('messageReactionAdd', (messageReaction, user) => {
        if (user.id === client.user?.id) {
            return;
        }

        new ProductionSchema().finishProd(messageReaction.message.id).catch((err) => {
            if (typeof err === 'string') {
                const serverId: string | undefined = messageReaction.message.guild?.id;

                if (serverId) {
                    new ServerSchema().getById(new ObjectId(serverId)).then((server: CServer) => {
                        DiscordBot.putError(server.defaultChannel || messageReaction.message.channel as TextChannel, err).catch(() => console.error(err));
                    }).catch(() => console.error(err));
                } else {
                    messageReaction.message.reply(err).catch(() => console.error(err));
                }
            } else {
                console.error(err);
            }
        });
    });
}