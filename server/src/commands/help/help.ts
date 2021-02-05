import { Message } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { CCommand, CommandsList } from "@commands/commands";
import DiscordBot, { EEmbedMsgColors } from "init/bot";

export function help(server: CServer, command?: CCommand<any>): Promise<Message> | undefined {
    if (command) {
        return command.sendHelp(server);
    }
    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP, "HELP");

    CommandsList.forEach((cmd) => cmd.getHelp(embedMessage));
    return server.defaultChannel?.send(embedMessage);
}