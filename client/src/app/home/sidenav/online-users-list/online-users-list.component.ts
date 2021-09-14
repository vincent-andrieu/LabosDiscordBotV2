import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { DiscordUser } from '@global/interfaces/discord.interface';
import { ServerService } from '@services/server.service';

@Component({
    selector: 'app-online-users-list',
    templateUrl: './online-users-list.component.html',
    styleUrls: ['./online-users-list.component.scss']
})
export class OnlineUsersListComponent {
    public userList: Array<DiscordUser | null> = [];
    public serverAvatar?: string;

    constructor(_socket: Socket, private _serverService: ServerService) {

        this._serverService.getServerAvatar().then((avatar) => this.serverAvatar = avatar);

        _socket.on('users.list', (onlineUsers: Array<DiscordUser | null>) => {
            this.userList = onlineUsers;
            this._removeDuplicateMembers();
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