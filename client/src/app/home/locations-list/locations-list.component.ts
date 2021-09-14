import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';

import { GlobalConfig } from '@global/config';
import { ILocation } from '@global/interfaces/locations.interface';
import { CLocation } from '@interfaces/location.class';
import { ServerService } from '@services/server.service';
import { LocationService } from '@services/location.service';
import { ConfirmModalComponent } from '@shared/confirm-modal/confirm-modal.component';
import { EPageStatus } from '@interfaces/root.interface';
import { EditLocationModalComponent } from '@shared/edit-location-modal/edit-location-modal.component';

@Component({
    selector: 'app-locations-list',
    templateUrl: './locations-list.component.html',
    styleUrls: ['./locations-list.component.scss']
})
export class LocationsListComponent {
    public displayedColumns: Array<string> = ['date', 'date-duration', 'actions'];
    public locations: Array<CLocation> = [];
    public locationForms: { [locId: string]: FormControl } = {};
    public dateFormat = GlobalConfig.locations.dateFormat;
    public isLoading = true;
    public today: Date = new Date();

    constructor(
        private _dialog: MatDialog,
        private _socket: Socket,
        private _serverService: ServerService,
        private _locationService: LocationService
    ) {
        this._updateLocations();

        _socket.on(`location.add`, (location: ILocation) => {
            if (location._id) {
                this.locations.push(new CLocation(location));
                this.locationForms[location._id.toString()] = new FormControl();
            }
        });

        _socket.on(`location.del`, (location: ILocation) => {
            this.locations.remove((loc) => loc._id === location._id);
        });

        _socket.on(`location.edit`, (location: ILocation) => {
            const foundLoc = this.locations.find((loc) => loc._id === location._id);

            if (foundLoc) {
                foundLoc.name = location.name;
                foundLoc.date = location.date;
                foundLoc.reminders = location.reminders || [];
                foundLoc.screen = location.screen;
                foundLoc.tag = location.tag || "";
            }
        });

        _socket.on(`location.reminder.add`, (location: ILocation) => {
            const foundLoc = this.locations.find((loc) => loc._id === location._id);

            if (foundLoc) {
                foundLoc.reminders = location.reminders || [];
            }
        });

        _socket.on(`location.reminder.del`, (location: ILocation) => {
            const foundLoc = this.locations.find((loc) => loc._id === location._id);

            if (foundLoc) {
                foundLoc.reminders = location.reminders || [];
            }
        });

        _socket.on(`location.tag`, (location: ILocation) => {
            const foundLoc = this.locations.find((loc) => loc._id === location._id);

            if (foundLoc) {
                foundLoc.tag = location.tag || "";
            }
        });
    }

    private _updateLocations(): void {
        this._locationService.get()
            .then((locations) => {
                this.locations = locations;

                this.locationForms = {};
                this.locations.forEach((loc: CLocation) => {
                    if (loc._id) {
                        this.locationForms[loc._id.toString()] = new FormControl();
                        loc.reminders.sort((a: Date, b: Date) => new Date(a).getTime() - new Date(b).getTime());
                    }
                });
                this.isLoading = false;
            });
    }

    public editLocation(location: CLocation): void {
        this._dialog.open(EditLocationModalComponent, {
            minWidth: '40%',
            data: {
                isCreate: false,
                location: location,
                list: this.locations
            }
        });
    }

    public deleteLocation(location: CLocation): void {
        const dialog = this._dialog.open(ConfirmModalComponent, {
            minWidth: '40%',
            data: {
                title: "Supprimer la location ?",
                message: `Êtes vous sûr de vouloir supprimer la location ${location.name} ?`,
                confirmButton: "Oui",
                cancelButton: "Non"
            }
        });

        dialog.afterClosed().subscribe((result) => {
            if (result) {
                this._locationService.del(location).finally(() => {
                    this._updateLocations();
                });
            }
        });
    }

    public addReminder(location: CLocation): void {
        if (!location._id || this.locationForms[location._id.toString()].invalid) {
            return;
        }
        this._locationService.addReminder(location, this.locationForms[location._id.toString()].value);
    }

    public deleteReminder(location: CLocation, reminder: Date): void {
        this._locationService.deleteReminder(location, reminder);
    }

}