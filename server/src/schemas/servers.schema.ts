import mongoose = require('mongoose');
import { Channel, Guild, TextChannel } from 'discord.js';

import { ObjectId } from "@global/interfaces/database.interface";
import { CServer, IServer } from '@global/interfaces/server.interface';
import { CLaboratory } from '@global/interfaces/laboratory.interface';
import { GlobalConfig } from '@global/config';

const serverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: false },
    //activity: { type: String, required: true },
    defaultLabo: { type: ObjectId, ref: 'laboratories', required: false },
    defaultChannel: { type: String, required: true },
    reminder: { type: Number, required: false, default: 0 },
    roleTag: { type: String, required: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

function autoPopulate(this: any, next: any) {
    this.populate('defaultLabo');
    next();
}

export class ServerSchema {
    private _model = mongoose.model('laboratories', serverSchema);

    /**
     * Auto convert defaultLabo & defaultChannel to their id
     * @param  {CServer} server
     * @returns Promise
     */
    public add(server: CServer): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {

            if (server.defaultLabo?._id) {
                server.defaultLabo = server.defaultLabo._id as unknown as CLaboratory;
            }
            if (server.defaultChannel?.id) {
                server.defaultChannel = server.defaultChannel.id as unknown as TextChannel;
            }
            this._model.create(server)
                .then((result) => {
                    resolve(new CServer(result as unknown as IServer));
                })
                .catch((err) => reject(err));

        });
    }

    /**
     * Auto convert defaultLabo & defaultChannel to their id
     * @param  {CServer} server
     * @returns Promise
     */
    public edit(server: CServer): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.defaultLabo?._id) {
                server.defaultLabo = server.defaultLabo._id as unknown as CLaboratory;
            }
            if (server.defaultChannel?.id) {
                server.defaultChannel = server.defaultChannel.id as unknown as TextChannel;
            }
            this._model.findByIdAndUpdate(server._id, server)
                .then(() => resolve())
                .catch((err) => reject(err));

        });
    }

    /**
     * Set default labo without checking if it exist
     * @param  {CLaboratory} labo
     * @returns Promise
     */
    public forceSetDefaultLabo(labo: CLaboratory): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!labo.server._id) {
                return reject("No server id");
            }

            this.getById(labo.server._id).then((server: CServer) => {
                server.defaultLabo = labo._id as unknown as CLaboratory;
                this.edit(server)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err));
            });

        });
    }

    public getById(id: ObjectId): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            this._model.findById(id)
                .then((result: IServer | undefined) => {
                    if (!result) {
                        return reject("Le serveur (" + id.toString() + ") n'existe pas");
                    }
                    resolve(new CServer(result));
                })
                .catch((err) => reject(err));
        });
    }

    public createOrGet(textChannel: TextChannel): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {

            this._model.findById(textChannel.guild.id)
                .then((server: IServer | undefined) => {
                    if (!server) {
                        this.add(new CServer({
                            _id: new ObjectId(textChannel.guild.id),
                            defaultChannel: textChannel
                        }))
                            .then((createdServer: CServer) => resolve(createdServer))
                            .catch((err) => reject(err));
                    } else {
                        return new CServer(server);
                    }
                })
                .catch((err) => reject(err));

        });
    }

    public setUrl(server: CServer, url: string): Promise<void> {
        server.url = url;
        return this.edit(server);
    }

    public setReminder(server: CServer, reminder: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (reminder < 0 || reminder > GlobalConfig.productions.timeoutMinutes) {
                return reject("Le rappel d'une production doit être comprit entre 0 (désactivé) et " + GlobalConfig.productions.timeoutMinutes.toString());
            }

            server.reminder = reminder;
            this.edit(server)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public setRoleTag(server: CServer, roleTag: string): Promise<void> {
        server.roleTag = roleTag;
        return this.edit(server);
    }
}