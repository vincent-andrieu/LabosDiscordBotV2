import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { ILocation } from '@global/interfaces/locations.interface';
import { CLocation } from '@interfaces/location.class';
import { MainService } from './main.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class LocationService extends MainService<CLocation, ILocation> {

    constructor(
        protected _injector: Injector,
        protected _http: HttpClient,
        private _serverService: ServerService,
        _socket: Socket
    ) {
        super('location', CLocation, _injector);

        _socket.on(`location.add`, (location: ILocation) => {
            this._snackbarService.open(`Location ${location.name} ajoutée`);
        });

        _socket.on(`location.del`, (location: ILocation) => {
            this._snackbarService.open(`Location ${location.name} supprimée`);
        });

        _socket.on(`location.edit`, (location: ILocation) => {
            this._snackbarService.open(`Location ${location.name} modifiée`);
        });

        _socket.on(`location.reminder.add`, (location: ILocation) => {
            this._snackbarService.open(`Rappel pour la location ${location.name} ajouté`);
        });

        _socket.on(`location.reminder.del`, (location: ILocation) => {
            this._snackbarService.open(`Rappel pour la location ${location.name} supprimé`);
        });

        _socket.on(`location.tag`, (location: ILocation) => {
            this._snackbarService.open(`Tag pour la location ${location.name} modifié`);
        });
    }

    public addReminder(location: CLocation, reminder: Date): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._http.put<ILocation>(`${this._serverUrl}/addReminder`, {
                userId: this._discordService.getUserId(),
                location: location,
                reminder: reminder
            }).subscribe((result: ILocation) =>
                resolve(new CLocation(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public deleteReminder(location: CLocation, reminder: Date): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._http.delete<ILocation>(`${this._serverUrl}/deleteReminder`, {
                params: {
                    userId: this._discordService.getUserId() || '',
                    location: JSON.stringify(location),
                    reminder: reminder.toString()
                }
            }).subscribe((result: ILocation) =>
                resolve(new CLocation(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public setTag(location: CLocation, tag: string): Promise<CLocation> {
        return new Promise<CLocation>((resolve, reject) => {
            this._http.post<ILocation>(`${this._serverUrl}/setTag`, {
                userId: this._discordService.getUserId(),
                location: location,
                tag: tag
            }).subscribe((result: ILocation) =>
                resolve(new CLocation(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}