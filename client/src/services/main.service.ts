import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injector, Type } from "@angular/core";

import { environment } from "@environment";
import { SnackbarService } from "./snackbar.service";
import { Router } from "@angular/router";
import { DiscordService } from "./discord.service";


export class MainService<C, I> {

    protected _serverUrl: string;
    protected _http: HttpClient = this._injector.get(HttpClient);
    protected _discordService: DiscordService = this._injector.get(DiscordService);
    protected _snackbarService: SnackbarService = this._injector.get(SnackbarService);
    protected _router: Router = this._injector.get(Router);

    constructor(readonly _serverUrlBase: string, private _ctor: Type<C>, protected _injector: Injector) {
        this._serverUrl = `${environment.server.url}/${_serverUrlBase}`;
    }

    public add(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.put<I>(`${this._serverUrl}/add`, param, {
                params: {
                    userId: this._discordService.getUserId() || ''
                }
            }).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public del(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.delete<I>(`${this._serverUrl}/delete`, {
                params: {
                    userId: this._discordService.getUserId() || '',
                    value: JSON.stringify(param)
                }
            }).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });

        });
    }

    public edit(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.post<I>(`${this._serverUrl}/edit`, param, {
                params: {
                    userId: this._discordService.getUserId() || ''
                }
            }).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public get(): Promise<Array<C>> {
        return new Promise<Array<C>>((resolve, reject) => {
            this._http.get<Array<I>>(`${this._serverUrl}/get`, {
                params: {
                    serverId: this._router.parseUrl(this._router.url).root.children.primary.segments[0].path
                }
            }).subscribe((result: Array<I>) =>
                resolve(result.map((value: I) => new this._ctor(value)))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}