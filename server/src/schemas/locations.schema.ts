import * as mongoose from 'mongoose';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import { CronJob } from 'cron';

import { ILocation } from '@global/interfaces/locations.interface';
import { CServer } from '@interfaces/server.class';
import { CLocation } from '@interfaces/location.class';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';
import { ServerSchema } from './servers.schema';
import { serverConfig } from '../server.config';

const locationSchema = new mongoose.Schema({
    server: { type: String, ref: 'servers', required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    screen: { type: String, required: false },
    reminders: [
        { type: Date }
    ],
    tag: { type: String, required: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

function autoPopulate(this: any, next: any) {
    this.populate('server');
    next();
}

export class LocationSchema {
    private _model = mongoose.model('locations', locationSchema);

    constructor(private _socketService: Sockets) {}

    public add(location: CLocation, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            if (!location.server) {
                return reject("No link to server");
            }
            if (location.date.getTime() <= new Date().getTime()) {
                return reject("La date de la fin de la location doit être dans le futur");
            }

            if (location._id) {
                delete location._id;
            }

            this.findOneByName(location.server, location.name)
                .then((loc) => reject("Une location existe déjà sous le nom " + loc.name))
                .catch(() => {
                    this._model.create(location)
                        .then((newLoc: unknown) => {
                            location._id = (newLoc as ILocation)._id;
                            this.startClock(location);

                            this._socketService.emit('location.add', location.server._id, location);
                            const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.ADD, "Location **" + location.name + "** ajoutée", userId)
                                .setDescription("Le **" + location.getHumanizeDate() + "**\nDans **" + location.getDateDuration() + "**");
                            if (location.screen) {
                                embedMessage.setImage(location.screen);
                            }
                            location.server.locationsChannel?.send(embedMessage);

                            resolve(location);
                        })
                        .catch((err) => reject(err));
                });
        });
    }

    public edit(location: CLocation, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            if (!location._id) {
                return reject("Location without ID");
            }

            this._model.findByIdAndUpdate(location._id, location)
                .then(() => {
                    this.getById(location).then((editedLoc: CLocation) => {
                        this.startClock(editedLoc);
                        this._socketService.emit('location.edit', location.server._id, editedLoc);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(editedLoc.server, EEmbedMsgColors.EDIT, "Location **" + editedLoc.name + "** modifiée", userId)
                            .setDescription("Le **" + editedLoc.getHumanizeDate() + "**\nDans **" + editedLoc.getDateDuration() + "**");
                        if (editedLoc.screen) {
                            embedMessage.setImage(editedLoc.screen);
                        }
                        editedLoc.server.locationsChannel?.send(embedMessage);
                        resolve(editedLoc);
                    });
                })
                .catch((err) => reject(err));
        });
    }

    public delete(location: CLocation, reason?: string, userId?: string, doesPrintMsg = true): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: location.server._id, _id: location._id })
                .then((res) => {
                    if (!res.deletedCount || res.deletedCount <= 0) {
                        return reject("La location " + location.name + " n'existe pas");
                    }

                    if (doesPrintMsg) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.DEL, "Location **" + location.name + "** supprimée", userId)
                            .setDescription(reason || "")
                            .addField("Le **" + location.getHumanizeDate() + "**", "Dans **" + location.getDateDuration() + "**");
                        if (location.screen) {
                            embedMessage.setImage(location.screen);
                        }
                        location.server.locationsChannel?.send(embedMessage);
                    }
                    this._socketService.emit('location.del', location.server._id, location);

                    resolve(res.deletedCount);
                })
                .catch((err) => reject(err));
        });
    }

    public deleteByName(server: CServer, name: string, reason?: string, userId?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.findOneByName(server, name).then((location) => {
                this.delete(location, reason, userId)
                    .then((nbrDeleted) => resolve(nbrDeleted))
                    .catch((err) => reject(err));

            }).catch((err) => reject(err));
        });
    }

    public async deleteByServer(server: CServer): Promise<void> {
        await this._model.deleteMany({ server: server._id });
    }

    public getAll(): Promise<Array<CLocation>> {
        return new Promise<Array<CLocation>>((resolve, reject) => {
            this._model.find({})
                .then((result: Array<unknown>) => {
                    resolve((result as Array<ILocation>).map((loc) => new CLocation(loc)));
                })
                .catch((err) => reject(err));
        });
    }

    public findOneByName(server: CServer, name: string, ignoreCase?: boolean): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.findOne({
                server: server._id,
                name: search
            })
                .then((result: unknown) => {
                    if (!result) {
                        return reject("Aucune location existe sous le nom " + name);
                    }
                    resolve(new CLocation(result as ILocation));
                })
                .catch((err) => reject(err));
        });
    }

    public findByName(server: CServer, name: string, ignoreCase?: boolean): Promise<Array<CLocation>> {
        return new Promise<Array<CLocation>>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.find({
                server: server._id,
                name: search
            })
                .then((result: Array<unknown>) => {
                    if (result.length == 0) {
                        return reject("Aucune location existe sous le nom " + name);
                    }
                    resolve((result as Array<ILocation>).map((loc) => new CLocation(loc)));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get location by its id. Return an error if it doesn't exist.
     * @param  {CLocation} location
     * @returns Promise
     */
    public getById(location: CLocation): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._model.findById(location._id)
                .then((result: unknown) => {
                    if (!result) {
                        return reject("La location " + location.name + " n'existe pas");
                    }
                    resolve(new CLocation(result as ILocation));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get an array of server's locations. Do NOT return an error if it doesn't have any location.
     * @param  {CServer} server
     * @returns Promise
     */
    public getByServer(server: CServer): Promise<Array<CLocation>> {
        return new Promise<Array<CLocation>>((resolve, reject) => {
            this._model.find({ server: server._id })
                .then((result: Array<unknown>) => resolve((result as Array<ILocation>).map((loc) => new CLocation(loc))))
                .catch((err) => reject(err));
        });
    }

    public getByServerId(serverId: string): Promise<Array<CLocation>> {
        return new Promise<Array<CLocation>>((resolve, reject) => {
            new ServerSchema(this._socketService).getById(serverId).then((server) => {
                this.getByServer(server).then((result) =>
                    resolve(result)
                ).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public addReminder(location: CLocation, reminder: Date, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            if (reminder.getTime() <= new Date().getTime() || reminder.getTime() >= location.date.getTime()) {
                return reject("La date du rappel doit être entre maintenant et la date de fin de la location");
            }
            this._model.findByIdAndUpdate(location._id, { $push: { reminders: reminder } })
                .then(() => {
                    location.reminders.push(reminder);
                    this.startClock(location, reminder);

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.ADD, "Rappel ajouté à la location **" + location.name + "**", userId)
                        .setDescription(`Pour le **${location.getHumanizeDate(reminder)}**\nDans **${location.getDateDuration(reminder)}**`);
                    if (location.screen) {
                        embedMessage.setThumbnail(location.screen);
                    }
                    location.server.locationsChannel?.send(embedMessage);

                    this._socketService.emit('location.reminder.add', location.server._id, location);
                    resolve(location);
                })
                .catch((err) => reject(err));
        });
    }

    public addReminderByName(server: CServer, name: string, reminder: Date, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this.findOneByName(server, name, true).then((location) => {
                this.addReminder(location, reminder, userId)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public deleteReminder(location: CLocation, reminder: Date, userId?: string, doesPrintMsg = true): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {

            this._model.findByIdAndUpdate(location._id, { $pull: { reminders: reminder.toISOString() } })
                .then(() => {
                    const index = location.reminders.findIndex((date) => new Date(date).getTime() === reminder.getTime());
                    if (index >= 0) {
                        location.reminders.splice(index, 1);
                    }

                    if (doesPrintMsg) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.DEL, "Rappel supprimé de la location **" + location.name + "**", userId)
                            .setDescription(`Le **${location.getHumanizeDate(reminder)}**\nDans **${location.getDateDuration(reminder)}**`);
                        if (location.screen) {
                            embedMessage.setThumbnail(location.screen);
                        }
                        location.server.locationsChannel?.send(embedMessage);
                    }

                    this._socketService.emit('location.reminder.del', location.server._id, location);
                    resolve(location);
                })
                .catch((err) => reject(err));

        });
    }

    public deleteReminderByName(server: CServer, name: string, reminder: Date, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this.findOneByName(server, name, false).then((location) => {
                this.deleteReminder(location, reminder, userId)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public setTag(location: CLocation, tag: string, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._model.findByIdAndUpdate(location._id, { tag: tag })
                .then(() => {
                    location.tag = tag;
                    const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.EDIT, "Le rôle à tag a été modifié", userId)
                        .setDescription(tag);
                    if (location.screen) {
                        embedMessage.setThumbnail(location.screen);
                    }
                    location.server.locationsChannel?.send(embedMessage);

                    this._socketService.emit('location.tag', location.server._id, location);
                    resolve(location);
                })
                .catch((err) => reject(err));
        });
    }

    public setTagByName(server: CServer, name: string, tag: string, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this.findOneByName(server, name, true).then((location) => {
                this.setTag(location, tag, userId)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    // Services

    public init(): void {
        this._updateClocks();

        const job = new CronJob(serverConfig.locationsCronUpdate, () => this._updateClocks(), null, true, 'Europe/Paris');
        job.start();
    }

    private _updateClocks(): void {
        this.getAll()
            .then((locations: Array<CLocation>) =>
                locations.forEach((location) => {
                    this.startClock(location);
                    location.reminders.forEach((reminder) => this.startClock(location, reminder));
                })
            )
            .catch((err) => console.error(err));
    }

    public startClock(location: CLocation, reminder: Date = location.date): void {
        if (moment(reminder).isAfter(moment(moment.now()).add(1, 'day'))) {
            return;
        }

        setTimeout(() => {
            this.getById(location).then((loc: CLocation) => {
                if (!this._doesReminderExist(loc, reminder)) {
                    return;
                }
                let embedMessage: MessageEmbed = DiscordBot.getDefaultEmbedMsg(loc.server, EEmbedMsgColors.DEL, "La location est finie");
                if (location.date.getTime() !== reminder.getTime()) {
                    embedMessage = DiscordBot.getDefaultEmbedMsg(loc.server, EEmbedMsgColors.INFO, "La location se finie dans **" + loc.getDateDuration() + "**");
                    this.deleteReminder(location, reminder, undefined, false);
                } else {
                    this.delete(location, "Location finie", undefined, false);
                }
                embedMessage.addField("**" + loc.name + "**", `Le **${loc.getHumanizeDate()}**`, true);
                if (loc.screen) {
                    embedMessage.setImage(loc.screen);
                }
                loc.server.locationsChannel?.send({ embed: embedMessage, content: loc.tag });
            });
        }, moment.duration(moment(reminder).diff(moment(moment.now()))).asMilliseconds());
    }

    private _doesReminderExist(location: CLocation, reminder: Date): boolean {
        if (location.date.getTime() === reminder.getTime()) {
            return true;
        }
        for (const rmder of location.reminders) {
            if (rmder.getTime() === reminder.getTime()) {
                return true;
            }
        }
        return false;
    }
}