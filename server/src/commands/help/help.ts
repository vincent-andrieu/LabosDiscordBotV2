import { Message } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CCommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";
import { CommandsList } from "@commands/commands";
import { serverConfig } from "server.config";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";

type CommandType = CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema | LocationSchema>;

export function help(server: CServer, commandParam?: CommandType | string, userId?: string): Promise<Message | undefined> | undefined {
    let command: CommandType | undefined = commandParam as CommandType;

    if (typeof commandParam === 'string') {
        const regex = new RegExp(commandParam, 'i');
        command = CommandsList.find((cmd) => regex.test(cmd.name));
    }
    if (command) {
        return command.sendHelp(server, userId);
    }
    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP, "HELP", userId);

    embedMessage.setDescription(`Chaque commande commence par **${serverConfig.commands.prefix}** et n'est pas sensible aux majuscules/minuscules.`);
    CommandsList.forEach((cmd) => cmd.getHelp(embedMessage));
    return server.defaultChannel?.send(embedMessage);
}