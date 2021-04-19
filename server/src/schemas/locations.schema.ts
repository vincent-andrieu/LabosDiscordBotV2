import * as mongoose from 'mongoose';

import { CServer } from '@interfaces/server.class';
import { CLocation } from '@interfaces/location.class';
import { ILocation } from '@global/interfaces/locations.interface';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';
import { ServerSchema } from './servers.schema';

const locationSchema = new mongoose.Schema({
    server: { type: String, ref: 'servers', required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    screen: { type: String, required: false }
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

    public add(location: CLocation, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            if (!location.server) {
                return reject("No link to server");
            }
            if (location.date.getTime() <= new Date().getTime()) {
                reject("La date de la fin de la location doit être dans le futur");
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
                            Sockets.server?.emit('location.add', location);
                            const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.ADD, "Location **" + location.name + "** ajoutée", userId)
                                .setDescription("Le " + location.getHumanizeDate() + "\nDans " + location.getDateDuration());
                            if (location.screen) {
                                embedMessage.setImage(location.screen);
                            }
                            location.server.defaultChannel?.send(embedMessage);

                            resolve(location);
                        })
                        .catch((err) => reject(err));
                });
        });
    }

    public edit(location: CLocation, userId?: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._model.findByIdAndUpdate(location._id, location)
                .then(() => {
                    this.getById(location).then((editedLoc: CLocation) => {
                        Sockets.server?.emit('location.edit', editedLoc);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.EDIT, "Location **" + editedLoc.name + "** modifiée", userId)
                            .setDescription("Le " + location.getHumanizeDate() + "\nDans " + location.getDateDuration());
                        if (location.screen) {
                            embedMessage.setImage(location.screen);
                        }
                        location.server.defaultChannel?.send(embedMessage);
                        resolve(editedLoc);
                    });
                })
                .catch((err) => reject(err));
        });
    }

    public delete(location: CLocation, reason?: string, userId?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: location.server._id, _id: location._id })
                .then((res) => {
                    if (!res.deletedCount || res.deletedCount <= 0) {
                        return reject("La location " + location.name + " n'existe pas");
                    }

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(location.server, EEmbedMsgColors.DEL, "Location **" + location.name + "** supprimée", userId);
                    if (location.screen) {
                        embedMessage.setImage(location.screen);
                    }
                    if (reason) {
                        embedMessage.setDescription(reason);
                    }
                    location.server.defaultChannel?.send(embedMessage);
                    Sockets.server?.emit('location.del', location);

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
            new ServerSchema().getById(serverId).then((server) => {
                this.getByServer(server).then((result) =>
                    resolve(result)
                ).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }
}