import { Client, Message } from "discord.js";
import { exit, pid } from "process";
import 'module-alias/register';

import { EXIT_ERROR } from "@global/utils";
import { ObjectId } from "@global/interfaces/database.interface";
import { CServer } from "@global/interfaces/server.interface";
import { ProductionSchema } from "@schemas/productions.schema";
import { ServerSchema } from "@schemas/servers.schema";
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

    client.on('messageReactionAdd', (messageReaction, user) => {
        if (user.id === client.user?.id) {
            return;
        }

        new ProductionSchema().finishProd(messageReaction.message.id).catch((err) => {
            if (typeof err === 'string') {
                const serverId: string | undefined = messageReaction.message.guild?.id;

                if (serverId) {
                    new ServerSchema().getById(new ObjectId(serverId)).then((server: CServer) => {
                        DiscordBot.putError(server, err)?.catch(() => console.error(err));
                    }).catch(() => console.error(err));
                } else {
                    console.error(err);
                }
            } else {
                console.error(err);
            }
        });
    });
}