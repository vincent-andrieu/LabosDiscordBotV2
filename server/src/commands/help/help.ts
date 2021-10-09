import { Message, TextChannel } from "discord.js";

import { CServer } from "@interfaces/server.class";
import { CCommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";
import { serverConfig } from "server.config";
import DiscordBot, { EEmbedMsgColors } from "../../init/bot";

type CommandType = CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema | LocationSchema>;

export function help(
    server: CServer,
    textChannel: TextChannel,
    commandParam?: CommandType | string,
    commandsList?: Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema | LocationSchema>>,
    userId?: string
): Promise<Message | undefined> | undefined {
    let command: CommandType | undefined = commandParam as CommandType;

    if (typeof commandParam === 'string') {
        if (!commandsList) {
            throw Error("No commands list");
        }
        const regex = new RegExp(commandParam, 'i');
        command = commandsList.find((cmd) => regex.test(cmd.name));
    }
    if (command) {
        return command.sendHelp(server, textChannel, userId);
    }
    if (!commandsList) {
        throw Error("No commands list");
    }
    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.HELP, "HELP", userId);

    embedMessage.setDescription(`Chaque commande commence par **${serverConfig.commands.prefix}** et n'est pas sensible aux majuscules/minuscules.\nLes arguments des commandes sont entre parenthèses, ceux en **gras** sont obligatoire, les autres optionnel.`);
    commandsList.forEach((cmd) => cmd.getHelp(embedMessage));
    return textChannel.send(embedMessage);
}