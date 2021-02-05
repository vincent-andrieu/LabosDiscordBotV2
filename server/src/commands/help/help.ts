import { Message } from "discord.js";

import { CServer } from "@global/interfaces/server.interface";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { CCommand, CommandsList } from "@commands/commands";
import DiscordBot, { EEmbedMsgColors } from "init/bot";

export function help(server: CServer, command?: CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema>): Promise<Message> | undefined {
    if (command) {
        return command.sendHelp(server);
    }
    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP, "HELP");

    CommandsList.forEach((cmd) => cmd.getHelp(embedMessage));
    return server.defaultChannel?.send(embedMessage);
}