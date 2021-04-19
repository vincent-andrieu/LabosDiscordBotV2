import { MessageEmbed } from "discord.js";
import moment from "moment";

import { GlobalConfig } from "@global/config";
import { ILocation } from "@global/interfaces/locations.interface";
import { CServerModel } from "./server.class";

export class CLocation extends CServerModel implements ILocation {
    name: string;
    date: Date;
    screen?: string;

    constructor(loc: ILocation) {
        super(loc);

        this.name = loc.name;
        this.date = loc.date;
        this.screen = loc.screen || "";
    }

    public getInfo(embedMessage?: MessageEmbed): string {
        const dateFormat = this.getHumanizeDate();

        if (embedMessage) {
            embedMessage.addField(this.name, dateFormat, true);
        }
        return `**${this.name}** => ${dateFormat} (${this.getDateDuration()})`;
    }

    public getHumanizeDate(): string {
        return moment(this.date).locale('fr').format(GlobalConfig.locations.dateFormat);
    }

    public getDateDuration(): string {
        return moment.duration(moment(this.date).diff(moment(moment.now()))).locale('fr').humanize();
    }
}