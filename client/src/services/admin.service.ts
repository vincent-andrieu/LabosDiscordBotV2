import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';

import { environment } from '@environment';
import { ERole, IUser } from '@global/interfaces/user.interface';
import { IServer } from '@global/interfaces/server.interface';
import { CServer } from '@interfaces/server.class';
import { SnackbarService } from './snackbar.service';
import { DiscordService } from './discord.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private _serverUrl = `${environment.server.url}/admin`;
    private _user?: IUser;
    private _onInit: Subject<void> = new Subject<void>();

    constructor(
        private _http: HttpClient,
        _socket: Socket,
        private _router: Router,
        private _snackbarService: SnackbarService,
        private _discordService: DiscordService,
        private _serverService: ServerService
    ) {
        const userId = this._discordService.getUserId();

        if (userId) {
            this._http.get<IUser>(`${this._serverUrl}/user`, {
                params: {
                    userId: userId
                }
            }).subscribe(
                (result: IUser) => {
                    this._user = result;
                    this._onInit.next();
                },
                (err: HttpErrorResponse) => this._snackbarService.openError(err)
            );
        }

        _socket.on(`server.delete`, (server: IServer) => {
            if (server._id === this._serverService.getCurrentServerId()) {
                this._router.navigate([server._id]);
            }
        });
    }

    public get onInit$(): Observable<void> {
        return this._onInit.asObservable();
    }

    public get isAdmin(): boolean {
        if (!this._user) {
            return false;
        }
        return this._user?.role === ERole.ADMIN;
    }

    public async getServers(): Promise<Array<CServer>> {
        const userId = this._discordService.getUserId();
        if (!userId || !this.isAdmin) {
            throw "Permission denied";
        }

        const servers = await this._http.get<Array<IServer>>(`${this._serverUrl}/servers`, {
            params: {
                userId: userId
            }
        }).toPromise();
        return servers.map((server) => new CServer(server));
    }

    public async deleteServer(server: CServer): Promise<void> {
        const userId = this._discordService.getUserId();
        if (!userId || !this.isAdmin) {
            throw "Permission denied";
        }

        await this._http.delete(`${this._serverUrl}/server`, {
            params: {
                userId: userId,
                server: JSON.stringify(server)
            }
        }).toPromise();
    }
}