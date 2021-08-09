import { Client, Message, TextChannel } from "discord.js";
import express from 'express';
import { exit, pid } from "process";
import 'module-alias/register';

import { EXIT_ERROR } from "@global/utils";
import { CServer } from "@interfaces/server.class";
import { ProductionSchema } from "@schemas/productions.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";
import { CommandsList } from "@commands/commands";
import { help } from "@commands/help/help";
import DiscordBot from "./init/bot";
import DataBase from "./init/database";
import ExpressServer from "./init/express";
import { serverConfig } from "./server.config";

Promise.all([
    DataBase.connect(),
    new DiscordBot().connect()
])
    .then((result) => {
        new LocationSchema().init();
        new ExpressServer(express(), result[1]);
        startBot(result[1]);
    })
    .catch((err) => {
        console.error(err);
        exit(EXIT_ERROR);
    });

console.info("PID : " + pid);

function startBot(client: Client) {

    client.on('message', (message: Message) => {
        if (message.author.id === client.user?.id || !message.content.startsWith(serverConfig.commands.prefix)) {
            return;
        }

        const msgElems: Array<string> = message.content.substr(1).split(" ");
        new ServerSchema().createOrGet(message.channel as TextChannel)
            .then((server: CServer) => {
                if (msgElems[0] === "help") {
                    message.delete();
                    return help(server, msgElems[1], message.member?.id || message.author.id);
                }
                const cmdFunc = CommandsList.find((cmd) => cmd.name.toLowerCase() === msgElems[0].toLowerCase());
                if (cmdFunc) {
                    message.delete();
                    msgElems.splice(0, 1);
                    cmdFunc.doAction(server, msgElems, message.member, message.channel as TextChannel).catch((err) => {
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

        new ProductionSchema().finishProd(messageReaction.message.id, user.id).catch((err) => {
            if (!err) {
                return;
            }
            if (typeof err === 'string') {
                const serverId: string | undefined = messageReaction.message.guild?.id;

                if (serverId) {
                    new ServerSchema().getById(serverId).then((server: CServer) => {
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