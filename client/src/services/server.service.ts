import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

import { environment } from '@environment';
import { IServer } from '@global/interfaces/server.interface';
import { GlobalConfig } from '@global/config';
import { CServer } from '@interfaces/server.class';
import { SnackbarService } from './snackbar.service';
import { DiscordService } from './discord.service';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

    private _serverUrl = `${environment.server.url}/server`;
    private _serverId = "";

    constructor(private _http: HttpClient, private _discordService: DiscordService, private _snackbarService: SnackbarService, private _socket: Socket, private _router: Router) {

        _socket.on(`server.reminder`, (server: IServer) => {
            this._snackbarService.open(`Rappel modifié`);
        });

        _socket.on(`server.password`, (server: IServer) => {
            this._snackbarService.open(`Mot de passe modifié`);
            this._router.navigate([this._router.parseUrl(this._router.url).root.children.primary.segments[0].path]);
        });
    }

    public login(serverId: string, serverPassword: string, userId = this._discordService.getUserId()): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._http.get<boolean>(`${this._serverUrl}/login`, {
                params: {
                    serverId: serverId,
                    password: serverPassword,
                    userId: userId || ''
                }
            }).subscribe((isValid: boolean) => {
                if (isValid) {
                    this._serverId = serverId;
                }
                resolve(isValid);
            }, (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public setReminder(reminder: number): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            if (reminder < 0 || reminder >= GlobalConfig.productions.timeoutMinutes) {
                const errMsg = "Le rappel doit être comprit entre 0 et " + GlobalConfig.productions.timeoutMinutes;
                this._snackbarService.openCustomError(errMsg);
                return reject(errMsg);
            }
            this._http.post<IServer>(`${this._serverUrl}/setReminder`, {
                userId: this._discordService.getUserId(),
                serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path,
                reminder: reminder
            }).subscribe((result: IServer) =>
                resolve(new CServer(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public setRoleTag(roleTag: string): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            this._http.post<IServer>(`${this._serverUrl}/setRoleTag`, {
                userId: this._discordService.getUserId(),
                serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path,
                roleTag: roleTag
            }).subscribe((result: IServer) =>
                resolve(new CServer(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public getCurrentServer(): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            this._http.get<IServer>(`${this._serverUrl}/get`, {
                params: {
                    serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path
                }
            }).subscribe((result: IServer) => {
                resolve(new CServer(result));
            }, (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public getCurrentServerId(): string | undefined {
        if (!this._serverId || !this._router.url.includes(this._serverId)) {
            return undefined;
        }
        return this._serverId;
    }

    public getServerName(): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve, reject) => {
            this._http.get<string | undefined>(`${this._serverUrl}/name`, {
                params: {
                    serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path
                }
            }).subscribe((name: string | undefined) =>
                resolve(name)
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public getServerAvatar(): Promise<string | undefined> {
        return new Promise<string | undefined>((resolve, reject) => {
            this._http.get<string | undefined>(`${this._serverUrl}/avatar`, {
                params: {
                    serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path
                }
            }).subscribe((avatar: string | undefined) =>
                resolve(avatar)
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}