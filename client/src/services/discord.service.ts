import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

import { environment } from '@environment';
import { btoa } from '@global/utils';
import { DiscordUser } from '@global/interfaces/user.interface';
import { CServer } from '@interfaces/server.class';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class DiscordService {
    private _serverUrl = `${environment.server.url}/discord`;

    constructor(
        private _http: HttpClient,
        private _cookieService: CookieService,
        private _snackbarService: SnackbarService,
        private _router: Router
    ) {}

    public redirectToAuth(): void {
        const urlSegments = this._router.parseUrl(this._router.url).root.children.primary.segments;
        this._http.get<string>(`${this._serverUrl}/get/url`, {
            params: {
                serverId: urlSegments[0].path,
                password: urlSegments[1].path
            }
        }).subscribe((url: string) => {
            window.location.href = url;
        }, (err: HttpErrorResponse) => {
            this._snackbarService.openError(err);
        });
    }

    public setToken(code: string, serverId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._http.get<string>(`${this._serverUrl}/set`, {
                params: {
                    serverId: serverId,
                    code: code
                }
            }).subscribe((userId: string) => {
                this._setUserIdCookie(userId.toString());
                resolve();
            },
            (err) => {
                this._snackbarService.openError(err);
                reject();
            });
        });
    }
    private _setUserIdCookie(userId: string) {
        this._cookieService.put(environment.cookiesName.discordUserId, btoa(userId), {
            expires: environment.cookiesDuration,
            sameSite: true,
            storeUnencoded: false
        });
    }

    public getUserId(): string | undefined {
        return this._cookieService.get(environment.cookiesName.discordUserId);
    }

    public remove(): void {
        this._cookieService.remove(environment.cookiesName.discordUserId);
        this._snackbarService.open("Compte discord dissocié");
    }

    public getChannelUsers(server: CServer): Promise<Array<DiscordUser>> {
        return new Promise<Array<DiscordUser>>((resolve, reject) => {
            this._http.get<Array<DiscordUser>>(`${this._serverUrl}/get/channel/users`, {
                params: {
                    server: JSON.stringify(server)
                }
            }).subscribe((users: Array<DiscordUser>) => {
                resolve(users);
            },
            (err) => {
                this._snackbarService.openError(err);
                reject();
            });
        });
    }
}