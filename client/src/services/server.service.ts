import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '@environment';
import { IServer } from '@global/interfaces/server.interface';
import { GlobalConfig } from '@global/config';
import { CServer } from '@interfaces/server.class';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class ServerService {

    private _serverUrl = `${environment.server.url}/server`;

    constructor(private _http: HttpClient, private _snackbarService: SnackbarService) {}

    public login(serverId: string, serverPassword: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._http.get<boolean>(`${this._serverUrl}/login`, {
                params: {
                    serverId: serverId,
                    password: serverPassword
                }
            }).subscribe((isValid: boolean) => {
                resolve(isValid);
            }, (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public setReminder(server: CServer, reminder: number): Promise<CServer> {
        return new Promise<CServer>((resolve, reject) => {
            if (reminder < 0 || reminder >= GlobalConfig.productions.timeoutMinutes) {
                const errMsg = "Le rappel doit être comprit entre 0 et " + GlobalConfig.productions.timeoutMinutes;
                this._snackbarService.openCustomError(errMsg);
                return reject(errMsg);
            }
            this._http.post<IServer>(`${this._serverUrl}/setReminder`, {
                server: server,
                reminder: reminder
            }).subscribe((result: IServer) =>
                resolve(new CServer(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}