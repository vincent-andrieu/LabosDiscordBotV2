import { Guild, GuildMember } from 'discord.js';
import { Server, Socket } from 'socket.io';

import { atob } from '@global/utils';
import { OnlineUser } from '@global/interfaces/user.interface';
import DiscordBot from '../init/bot';

export class OnlineUsersService {
    private _socketsList: { [socketId: string]: { serverId: string, user: OnlineUser | null } } = {};
    private _onlineUsers: { [serverId: string]: Array<OnlineUser | null> } = {};

    constructor(private _io: Server) {}

    public updateList(serverId?: string): void {
        if (serverId) {
            this._io.emit('users.list', <{ serverId: string, list: Array<OnlineUser | null> }>{
                serverId: serverId,
                list: this._onlineUsers[serverId]
            });
        } else {
            Object.keys(this._onlineUsers).forEach((serverId: string) => this.updateList(serverId));
        }
    }

    public userConnection(socket: Socket): void {
        socket.emit('users.getId');

        socket.on('users.getId.callback', (serverId: string, userId: string | undefined) => {
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
        const member = DiscordBot.getMemberFromGuild(guild, userId);
        if (!member) {
            return this._addUnknownUser(socket, guild);
        }
        this._addDiscordUser(socket, guild, member);
    }

    private _addDiscordUser(socket: Socket, guild: Guild, member: GuildMember): void {
        const onlineUser: OnlineUser = {
            id: member.id,
            name: member.displayName,
            avatar: member.user.displayAvatarURL()
        };

        if (!this._onlineUsers[guild.id]) {
            this._onlineUsers[guild.id] = [];
        }
        this._onlineUsers[guild.id].push(onlineUser);
        this._socketsList[socket.id] = { serverId: guild.id, user: onlineUser };
        this.updateList(guild.id);
    }

    private _addUnknownUser(socket: Socket, guild: Guild): void {
        if (!this._onlineUsers[guild.id]) {
            this._onlineUsers[guild.id] = [];
        }
        this._onlineUsers[guild.id].push(null);
        this._socketsList[socket.id] = { serverId: guild.id, user: null };
        this.updateList(guild.id);
    }

    public removeUser(socket: Socket): void {
        const user = this._socketsList[socket.id];

        if (user) {
            this._onlineUsers[user.serverId].remove((member) => member === user.user);
            this.updateList(user.serverId);
            delete this._socketsList[socket.id];
        }
    }
}