import { MessageEmbed } from "discord.js";
import moment from "moment";

import { GlobalConfig } from "@global/config";
import { ILocation } from "@global/interfaces/locations.interface";
import { CServerModel } from "./server.class";

export class CLocation extends CServerModel implements ILocation {
    name: string;
    date: Date;
    screen?: string;
    reminders: Array<Date>;

    constructor(loc: ILocation) {
        super(loc);

        this.name = loc.name;
        this.date = loc.date;
        this.screen = loc.screen || "";
        this.reminders = loc.reminders || [];
    }

    public getInfo(embedMessage?: MessageEmbed): string {
        const dateFormat = this.getHumanizeDate();
        const dateDuration = this.getDateDuration();

        if (embedMessage) {
            embedMessage.addField(this.name, `Le **${dateFormat}**\nDans **${dateDuration}**`, true);
        }
        return `**${this.name}** => ${dateFormat} (${dateDuration})`;
    }

    public getHumanizeDate(date: Date = this.date): string {
        return moment(date).locale('fr').format(GlobalConfig.locations.dateFormat);
    }

    public getDateDuration(date: Date = this.date): string {
        return moment.duration(moment(date).diff(moment(moment.now()))).locale('fr').humanize();
    }
}