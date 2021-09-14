import { Guild, GuildMember } from 'discord.js';
import { Socket } from 'socket.io';

import { atob } from '@global/utils';
import { DiscordUser } from '@global/interfaces/discord.interface';
import DiscordBot from '../init/bot';

export class OnlineUsersService {
    private _socketsList: { [socketId: string]: { socket: Socket, serverId: string, user: DiscordUser | null } } = {};
    private _onlineUsers: { [serverId: string]: Array<DiscordUser | null> } = {};

    public emit<T>(event: string, serverId?: string, data?: T): void {
        if (serverId) {
            Object.keys(this._socketsList)
                .filter((socketId: string) => this._socketsList[socketId].serverId === serverId)
                .forEach((socketId) =>
                    this._socketsList[socketId].socket.emit(event, data)
                );
        } else {
            Object.keys(this._onlineUsers).forEach((elemServerId: string) => this._updateList(elemServerId));
        }
    }

    //
    // Update
    //

    private _updateList(serverId?: string): void {
        if (serverId) {
            Object.keys(this._socketsList)
                .filter((socketId: string) => this._socketsList[socketId].serverId === serverId)
                .forEach((socketId) =>
                    this._socketsList[socketId].socket.emit('users.list', this._onlineUsers[serverId])
                );
        } else {
            Object.keys(this._onlineUsers).forEach((serverId: string) => this._updateList(serverId));
        }
    }

    //
    // Connection
    //

    public userConnection(socket: Socket): void {
        socket.on('users.login', (serverId: string, userId: string | undefined) => {
            this._addUser(socket, serverId, atob(userId));
        });
    }

    private _addUser(socket: Socket, serverId: string, userId: string | undefined) {
        const guild = DiscordBot.getServerFromId(serverId);
        if (!guild) {
            return;
        }
        if (!userId) {
            return this._addUnknownUser(socket, guild);
        }
        let member = DiscordBot.getMemberFromGuild(guild, userId);

        if (!member) {
            guild.members.fetch(userId).then((collection) => {
                member = collection || DiscordBot.getMemberFromGuild(guild, userId);
                if (!member) {
                    return this._addUnknownUser(socket, guild);
                }
                this._addDiscordUser(socket, guild, member);
            })
                .catch(() => {
                    console.warn(`User (${userId}) isn't in the guild`);
                    this._addUnknownUser(socket, guild);
                });
        } else {
            this._addDiscordUser(socket, guild, member);
        }
    }

    private _addDiscordUser(socket: Socket, guild: Guild, member: GuildMember): void {
        const onlineUser: DiscordUser = {
            id: member.id,
            name: member.displayName,
            avatar: member.user.displayAvatarURL(),
            color: member.displayHexColor
        };

        if (!this._onlineUsers[guild.id]) {
            this._onlineUsers[guild.id] = [];
        }
        this._onlineUsers[guild.id].push(onlineUser);
        this._socketsList[socket.id] = { socket: socket, serverId: guild.id, user: onlineUser };
        this._updateList(guild.id);
    }

    private _addUnknownUser(socket: Socket, guild: Guild): void {
        if (!this._onlineUsers[guild.id]) {
            this._onlineUsers[guild.id] = [];
        }
        if (!this._socketsList[socket.id]) {
            this._onlineUsers[guild.id].push(null);
            this._socketsList[socket.id] = { socket: socket, serverId: guild.id, user: null };
        }
        this._updateList(guild.id);
    }

    //
    // Disconnection
    //

    public removeUser(socket: Socket): void {
        const user = this._socketsList[socket.id];

        if (user) {
            this._onlineUsers[user.serverId].remove((member) => member === user.user);
            this._updateList(user.serverId);
            delete this._socketsList[socket.id];
        }
    }
}