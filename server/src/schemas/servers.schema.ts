import mongoose = require('mongoose');
import { TextChannel } from 'discord.js';

import { ObjectId } from "@global/interfaces/database.interface";
import { IServer } from '@global/interfaces/server.interface';
import { CServer } from "@interfaces/server.class";
import { CLaboratory } from '@interfaces/laboratory.class';
import { GlobalConfig } from '@global/config';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';

const serverSchema = new mongoose.Schema({
    _id: { type: String, required: true },
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
    private _model = mongoose.model('servers', serverSchema);

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

    public getById(id: string): Promise<CServer> {
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
                            _id: textChannel.guild.id,
                            defaultChannel: textChannel
                        }))
                            .then((createdServer: CServer) => resolve(createdServer))
                            .catch((err) => reject(err));
                    } else {
                        resolve(new CServer(server));
                    }
                })
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

            this.getById(labo.server._id.toString()).then((server: CServer) => {
                server.defaultLabo = labo._id as unknown as CLaboratory;
                this.edit(server)
                    .then(() => {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau laboratoire par défaut");
                        if (labo.screen) {
                            embedMessage.setThumbnail(labo.screen);
                        }
                        embedMessage.setDescription("**" + labo.name + "**");
                        server.defaultChannel?.send(embedMessage);

                        resolve();
                    })
                    .catch((err) => reject(err));
            });

        });
    }

    public setDefaultChannel(server: CServer, textChannel: TextChannel): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.defaultChannel?.id === textChannel.id) {
                return reject(textChannel.name.toString() + " est déjà le channel par défaut");
            }

            server.defaultChannel = textChannel;
            this.edit(server)
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau channel par défaut");
                    const guildIcon = textChannel.guild?.iconURL();
                    if (guildIcon) {
                        embedMessage.setThumbnail(guildIcon);
                    }
                    embedMessage.setDescription("**" + textChannel.name?.toString() + "**");
                    textChannel.send(embedMessage);

                    resolve();
                })
                .catch((err) => reject(err));
        });
    }

    public setUrl(server: CServer, url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.url === url) {
                return reject(url.toString() + " est déjà l'URL utilisé");
            }

            server.url = url;
            this.edit(server)
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouvel URL");
                    const guildIcon = server.defaultChannel?.guild?.iconURL();
                    if (guildIcon) {
                        embedMessage.setThumbnail(guildIcon);
                    }
                    embedMessage.setDescription("**" + url.toString() + "**");
                    server.defaultChannel?.send(embedMessage);

                    resolve();
                })
                .catch((err) => reject(err));
        });
    }

    public setReminder(server: CServer, reminder: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (reminder < 0 || reminder > GlobalConfig.productions.timeoutMinutes) {
                return reject("Le rappel d'une production doit être comprit entre 0 (désactivé) et " + GlobalConfig.productions.timeoutMinutes.toString());
            }
            if (server.reminder === reminder) {
                return reject("Le rappel est déjà défini à " + reminder.toString());
            }

            server.reminder = reminder;
            this.edit(server)
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Changement du rappel");
                    const guildIcon = server.defaultChannel?.guild?.iconURL();
                    if (guildIcon) {
                        embedMessage.setThumbnail(guildIcon);
                    }
                    embedMessage.setDescription("**" + reminder.toString() + " minutes** avant la fin de la production");
                    server.defaultChannel?.send(embedMessage);

                    resolve();
                })
                .catch((err) => reject(err));
        });
    }

    public setRoleTag(server: CServer, roleTag: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.roleTag === roleTag) {
                return reject("Ce rôle est déjà défini");
            }

            server.roleTag = roleTag;
            this.edit(server)
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau rôle");
                    const guildIcon = server.defaultChannel?.guild?.iconURL();
                    if (guildIcon) {
                        embedMessage.setThumbnail(guildIcon);
                    }
                    embedMessage.setDescription("**ID : " + roleTag.toString() + "**");
                    server.defaultChannel?.send(embedMessage);

                    resolve();
                })
                .catch((err) => reject(err));
        });
    }
}