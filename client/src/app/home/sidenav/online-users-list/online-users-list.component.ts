import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { DiscordUser } from '@global/interfaces/user.interface';
import { DiscordService } from '@services/discord.service';
import { ServerService } from '@services/server.service';
import { CServer } from '@interfaces/server.class';

@Component({
    selector: 'app-online-users-list',
    templateUrl: './online-users-list.component.html',
    styleUrls: ['./online-users-list.component.scss']
})
export class OnlineUsersListComponent {
    public userList: Array<DiscordUser | null> = [];
    public serverAvatar?: string;

    constructor(private _socket: Socket, private _discordService: DiscordService, private _serverService: ServerService) {

        this._serverService.getServerAvatar().then((avatar) => this.serverAvatar = avatar);

        _socket.on('users.list', (onlineUsers: { serverId: string, list: Array<DiscordUser | null> }) => {
            if (onlineUsers.serverId === this._serverService.getCurrentServerId()) {
                this.userList = onlineUsers.list;
                this._removeDuplicateMembers();
            }
        });

        _socket.on('users.getId', () => {
            _socket.emit('users.getId.callback', this._serverService.getCurrentServerId(), this._discordService.getUserId());
        });
    }

    private _removeDuplicateMembers(): void {
        const tempList: Array<DiscordUser | null> = [];

        this.userList.forEach((member) => {
            if (member === null || !tempList.find((tempMember) => tempMember?.id === member?.id)) {
                tempList.push(member);
            }
        });
        this.userList = tempList;
    }

}