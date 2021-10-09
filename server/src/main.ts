import { Client, Message, TextChannel } from "discord.js";
import express from 'express';
import { exit, pid } from "process";
import 'module-alias/register';

import { EXIT_ERROR } from "@global/utils";
import { CServer } from "@interfaces/server.class";
import { ProductionSchema } from "@schemas/productions.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";
import getCommandsList from "@commands/commands";
import { help } from "@commands/help/help";
import DiscordBot from "./init/bot";
import DataBase from "./init/database";
import ExpressServer from "./init/express";
import Sockets from "./init/sockets";
import { serverConfig } from "./server.config";

Promise.all([
    DataBase.connect(),
    new DiscordBot().connect()
])
    .then((result) => {
        new ExpressServer(express(), result[1]).connect().then((socketService) => {
            new LocationSchema(socketService).init();
            startBot(result[1], socketService);
        });
    })
    .catch((err) => {
        console.error(err);
        exit(EXIT_ERROR);
    });

console.info("PID : " + pid);

function startBot(client: Client, socketService: Sockets) {
    const commandsList = getCommandsList(socketService);

    client.on('message', (message: Message) => {
        if (message.author.id === client.user?.id || !message.content.startsWith(serverConfig.commands.prefix)) {
            return;
        }

        const msgElems: Array<string> = message.content.substr(1).split(" ");
        new ServerSchema(socketService).createOrGet(message.channel as TextChannel)
            .then((server: CServer) => {
                if (msgElems[0] === "help") {
                    message.delete();
                    return help(server, message.channel as TextChannel, msgElems[1], commandsList, message.member?.id || message.author.id);
                }
                const cmdFunc = commandsList.find((cmd) => cmd.name.toLowerCase() === msgElems[0].toLowerCase());
                if (cmdFunc) {
                    message.delete();
                    msgElems.splice(0, 1);
                    cmdFunc.doAction(server, message.channel as TextChannel, msgElems, message.member).catch((err) => {
                        if (typeof err === 'string') {
                            DiscordBot.putError(message.channel as TextChannel, err)
                                .catch(() => DiscordBot.putError(server.defaultChannel as TextChannel, err, message.member?.id || message.author.id)
                                    .catch(() => console.error(err)));
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

        new ProductionSchema(socketService).finishProd(messageReaction.message.id, user.id).catch((err) => {
            if (!err) {
                return;
            }
            if (typeof err === 'string') {
                const serverId: string | undefined = messageReaction.message.guild?.id;

                if (serverId) {
                    new ServerSchema(socketService).getById(serverId).then((server: CServer) => {
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