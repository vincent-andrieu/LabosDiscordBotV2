import { Express } from 'express';
import { Server } from 'socket.io';

import { atob } from '@global/utils';
import { ILocation } from '@global/interfaces/locations.interface';
import { CLocation } from '@interfaces/location.class';
import { LocationSchema } from '@schemas/locations.schema';

export class LocationHttp {

    private _urlBase = '/location';
    private _locationSchema: LocationSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._locationSchema = new LocationSchema();
        this._init();
    }

    private _init(): void {

        // Add location
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const userId: string = request.query.userId as string;
            const location: ILocation = request.body;

            this._locationSchema.add(new CLocation(location), atob(userId)).then((newLocation: CLocation) => {
                response.send(newLocation);
            }).catch((err) => response.send(err));
        });

        // Delete location
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const userId: string = request.query.userId as string;
            const location: ILocation = JSON.parse(request.query.value as string);

            this._locationSchema.delete(new CLocation(location), undefined, atob(userId)).then(() => {
                response.send(location);
            }).catch((err) => response.send(err));
        });

        // Edit location
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const userId: string = request.query.userId as string;
            const location: ILocation = request.body;

            this._locationSchema.edit(new CLocation(location), atob(userId)).then((editedLocation: CLocation) => {
                response.send(editedLocation);
            }).catch((err) => response.send(err));
        });

        // Get locations
        this._app.get(`${this._urlBase}/get`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._locationSchema.getByServerId(serverId).then((locations) => {
                response.send(locations);
            }).catch((err) => response.send(err));
        });

        // Add location reminder
        this._app.put(`${this._urlBase}/addReminder`, (request, response) => {
            const userId: string | undefined = request.body.userId;
            const location: CLocation = new CLocation(request.body.location);
            const reminder: Date = new Date(request.body.reminder);

            this._locationSchema.addReminder(location, reminder, atob(userId)).then((newLocation: CLocation) => {
                response.send(newLocation);
            }).catch((err) => response.send(err));
        });

        // Delete location reminder
        this._app.delete(`${this._urlBase}/deleteReminder`, (request, response) => {
            const userId: string = request.query.userId as string;
            const location: CLocation = new CLocation(JSON.parse(request.query.location as string));
            const reminder: Date = new Date(request.query.reminder as string);

            this._locationSchema.deleteReminder(location, reminder, atob(userId)).then((deletedLocReminder: CLocation) => {
                response.send(deletedLocReminder);
            }).catch((err) => response.send(err));
        });

        // Set location tag
        this._app.post(`${this._urlBase}/setTag`, (request, response) => {
            const userId: string = request.body.userId;
            const location: CLocation = new CLocation(request.body.location);
            const tag: string = request.body.tag;

            this._locationSchema.setTag(location, tag, atob(userId)).then(() => {
                response.send(location);
            }).catch((err) => response.send(err));
        });
    }
}