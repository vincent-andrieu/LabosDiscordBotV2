import { Component } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { GlobalConfig } from '@global/config';
import { ILocation } from '@global/interfaces/locations.interface';
import { CLocation } from '@interfaces/location.class';
import { ServerService } from '@services/server.service';
import { LocationService } from '@services/location.service';

@Component({
    selector: 'app-locations-list',
    templateUrl: './locations-list.component.html',
    styleUrls: ['./locations-list.component.scss']
})
export class LocationsListComponent {
    public displayedColumns: Array<string> = ['date', 'date-duration', 'actions'];
    public locations: Array<CLocation> = [];
    public dateFormat = GlobalConfig.locations.dateFormat;
    public isLoading = true;

    constructor(
        private _socket: Socket,
        private _serverService: ServerService,
        private _locationService: LocationService
    ) {
        this._updateLocations();

        _socket.on(`location.add`, (location: ILocation) => {
            if ((location.server._id || location.server) === this._serverService.getCurrentServerId()) {
                this.locations.push(new CLocation(location));
            }
        });

        _socket.on(`location.del`, (location: ILocation) => {
            if (location.server._id === this._serverService.getCurrentServerId()) {
                this.locations.remove((loc) => loc._id === location._id);
            }
        });

        _socket.on(`location.edit`, (location: ILocation) => {
            if (location.server._id === this._serverService.getCurrentServerId()) {
                const foundLoc = this.locations.find((loc) => loc._id === location._id);

                if (foundLoc) {
                    foundLoc.name = location.name;
                    foundLoc.date = location.date;
                    foundLoc.reminders = location.reminders || [];
                    foundLoc.screen = location.screen;
                    foundLoc.tag = location.tag || "";
                }
            }
        });

        _socket.on(`location.reminder.add`, (location: ILocation) => {
            if (location.server._id === this._serverService.getCurrentServerId()) {
                const foundLoc = this.locations.find((loc) => loc._id === location._id);

                if (foundLoc) {
                    foundLoc.reminders = location.reminders || [];
                }
            }
        });

        _socket.on(`location.reminder.del`, (location: ILocation) => {
            if (location.server._id === this._serverService.getCurrentServerId()) {
                const foundLoc = this.locations.find((loc) => loc._id === location._id);

                if (foundLoc) {
                    foundLoc.reminders = location.reminders || [];
                }
            }
        });

        _socket.on(`location.tag`, (location: ILocation) => {
            if (location.server._id === this._serverService.getCurrentServerId()) {
                const foundLoc = this.locations.find((loc) => loc._id === location._id);

                if (foundLoc) {
                    foundLoc.tag = location.tag || "";
                }
            }
        });
    }

    private _updateLocations(): void {
        this._locationService.get()
            .then((locations) => {
                this.locations = locations;
                this.isLoading = false;
            });
    }

    public editLocation(location: CLocation): void {

    }

    public deleteLocation(location: CLocation): void {

    }

    public addReminder(location: CLocation): void {

    }

    public deleteReminder(location: CLocation, reminder: Date): void {
        this._locationService.deleteReminder(location, reminder);
    }

}