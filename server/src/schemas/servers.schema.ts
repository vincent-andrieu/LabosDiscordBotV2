import mongoose = require('mongoose');
import { TextChannel } from 'discord.js';

import { IServer } from '@global/interfaces/server.interface';
import { CServer } from "@interfaces/server.class";
import { CLaboratory } from '@interfaces/laboratory.class';
import { GlobalConfig } from '@global/config';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';

const serverSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    url: { type: String, required: false },
    password: { type: String, required: false, default: "password" },
    //activity: { type: String, required: true },
    defaultLabo: { type: mongoose.Schema.Types.ObjectId, ref: 'laboratories', required: false },
    defaultChannel: { type: String, required: true },
    reminder: { type: Number, required: false, default: 0 },
    roleTag: { type: String, required: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

export class ServerSchema {
    private _model = mongoose.model('servers', serverSchema);

    public login(serverId: string, password: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._model.find({ _id: serverId, password: password }).then((result: Array<unknown>) => {
                resolve(result.length === 1);
            }).catch((err) => reject(err));
        });
    }

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
            this._model.findById(id).populate({
                path: 'defaultLabo',
                populate: {
                    path: 'stocks'
                }
            })
                .then((result: unknown) => {
                    if (!result) {
                        return reject("Le serveur (" + id.toString() + ") n'existe pas");
                    }
                    resolve(new CServer(result as IServer));
                })
                .catch((err) => reject(err));
        });
    }

    public createOrGet(textChannel: TextChannel): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {

            this._model.findById(textChannel.guild.id).populate({
                path: 'defaultLabo',
                populate: {
                    path: 'stocks'
                }
            })
                .then((server: unknown) => {
                    if (!server) {
                        this.add(new CServer({
                            _id: textChannel.guild.id,
                            defaultChannel: textChannel
                        }))
                            .then((createdServer: CServer) => resolve(createdServer))
                            .catch((err) => reject(err));
                    } else {
                        resolve(new CServer(server as IServer));
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
    public forceSetDefaultLabo(labo: CLaboratory, userId?: string): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            if (!labo.server._id) {
                return reject("No server id");
            }
            if (labo.server.defaultLabo?._id?.toString() === labo._id?.toString()) {
                return reject("Le laboratoire " + (labo.name || labo.server.defaultLabo?.name)?.toString() + " est déjà le laboratoire par défaut");
            }

            this.getById(labo.server._id.toString()).then((server: CServer) => {
                server.defaultLabo = labo._id as unknown as CLaboratory;
                this.edit(server)
                    .then(() => {
                        server = new CServer(server);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau laboratoire par défaut", userId);
                        if (labo.screen) {
                            embedMessage.setThumbnail(labo.screen);
                        }
                        embedMessage.setDescription("**" + labo.name + "**");
                        server.defaultChannel?.send(embedMessage);

                        Sockets.server?.emit('labo.default', labo);
                        resolve(labo);
                    })
                    .catch((err) => reject(err));
            });

        });
    }

    public deleteDefaultLabo(server: CServer, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const labo = server.defaultLabo;
            delete server.defaultLabo;
            this.edit(server).then(() => {
                server = new CServer(server);
                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.DEL, "Laboratoire par défaut supprimé", userId);
                if (labo?.screen) {
                    embedMessage.setThumbnail(labo?.screen);
                }
                if (labo?.name) {
                    embedMessage.setDescription("**" + labo?.name + "**");
                }
                server.defaultChannel?.send(embedMessage);

                resolve();
            }).catch((err) => reject(err));

        });
    }

    public setDefaultChannel(server: CServer, textChannel: TextChannel, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.defaultChannel?.id === textChannel.id) {
                return reject(textChannel.name.toString() + " est déjà le channel par défaut");
            }

            server.defaultChannel = textChannel;
            this.edit(server)
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau channel par défaut", userId);
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

    public setUrl(server: CServer, url: string, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (server.url === url) {
                return reject(url.toString() + " est déjà l'URL utilisé");
            }

            server.url = url;
            this.edit(server)
                .then(() => {
                    server = new CServer(server);

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouvel URL", userId);
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

    public setPassword(server: CServer, password: string, userId?: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            if (!password) {
                return reject("Nouveau mot de passe invalid");
            }

            server.password = password;
            this.edit(server).then(() => {
                const socketServer = { _id: server._id };
                Sockets.server?.emit('server.password', socketServer);
                server = new CServer(server);

                const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau mot de passe", userId);
                const guildIcon = server.defaultChannel?.guild?.iconURL();
                if (guildIcon) {
                    embedMessage.setThumbnail(guildIcon);
                }
                embedMessage.setDescription("**" + password.toString() + "**");
                server.defaultChannel?.send(embedMessage);

                resolve(server);
            });
        });
    }

    public setReminder(server: CServer, reminder: number, userId?: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            if (reminder < 0 || reminder > GlobalConfig.productions.timeoutMinutes) {
                return reject("Le rappel d'une production doit être comprit entre 0 (désactivé) et " + GlobalConfig.productions.timeoutMinutes.toString());
            }
            if (server.reminder === reminder) {
                return reject("Le rappel est déjà défini à " + reminder.toString());
            }

            server.reminder = reminder;
            this.edit(server)
                .then(() => {
                    server = new CServer(server);

                    if (reminder > 0) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Changement du rappel", userId);
                        const guildIcon = server.defaultChannel?.guild?.iconURL();
                        if (guildIcon) {
                            embedMessage.setThumbnail(guildIcon);
                        }
                        embedMessage.setDescription("**" + reminder.toString() + " minutes** avant la fin de la production");
                        server.defaultChannel?.send(embedMessage);
                    } else {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.DEL, "Suppression du rappel", userId);
                        const guildIcon = server.defaultChannel?.guild?.iconURL();
                        if (guildIcon) {
                            embedMessage.setThumbnail(guildIcon);
                        }
                        server.defaultChannel?.send(embedMessage);
                    }

                    Sockets.server?.emit('server.reminder', server);
                    resolve(server);
                })
                .catch((err) => reject(err));
        });
    }

    public setReminderFromId(serverId: string, reminder: number, userId?: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            this.getById(serverId).then((server: CServer) =>
                this.setReminder(server, reminder, userId)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err))
            ).catch((err) => reject(err));
        });
    }

    public setRoleTag(server: CServer, roleTag?: string, userId?: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {

            if (server.roleTag === roleTag) {
                return reject("Ce rôle est déjà défini");
            }

            server.roleTag = roleTag;
            this.edit(server)
                .then(() => {
                    server = new CServer(server);

                    if (roleTag) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.EDIT, "Nouveau rôle", userId);
                        const guildIcon = server.defaultChannel?.guild?.iconURL();
                        if (guildIcon) {
                            embedMessage.setThumbnail(guildIcon);
                        }
                        embedMessage.setDescription(roleTag);
                        server.defaultChannel?.send(embedMessage);
                    } else {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(server, EEmbedMsgColors.DEL, "Suppression du rôle", userId);
                        const guildIcon = server.defaultChannel?.guild?.iconURL();
                        if (guildIcon) {
                            embedMessage.setThumbnail(guildIcon);
                        }
                        server.defaultChannel?.send(embedMessage);
                    }

                    resolve(server);
                })
                .catch((err) => reject(err));
        });
    }

    public setRoleTagFromId(serverId: string, roleTag: string, userId?: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            this.getById(serverId).then((server: CServer) =>
                this.setRoleTag(server, roleTag, userId)
                    .then((result) => resolve(result))
                    .catch((err) => reject(err))
            ).catch((err) => reject(err));
        });
    }
}