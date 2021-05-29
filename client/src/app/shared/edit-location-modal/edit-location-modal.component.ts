import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiscordUser } from '@global/interfaces/discord.interface';

import { CLocation } from '@interfaces/location.class';
import { EPageStatus } from '@interfaces/root.interface';
import { CServer } from '@interfaces/server.class';
import { DiscordService } from '@services/discord.service';
import { LocationService } from '@services/location.service';
import { ServerService } from '@services/server.service';
import { SnackbarService } from '@services/snackbar.service';
import { ValidatorsService } from '@services/validators.service';

@Component({
    selector: 'app-edit-location-modal',
    templateUrl: './edit-location-modal.component.html',
    styleUrls: ['./edit-location-modal.component.scss']
})
export class EditLocationModalComponent  {
    private server?: CServer;
    public form = new FormGroup({
        name: new FormControl(this.data.location?.name || "", [
            Validators.required,
            this._validatorsService.doesHaveSpacesValidator(),
            this._validatorsService.doesAlreadyExistValidator(EPageStatus.LOCATIONS, this.data.list, this.data.location?.name)
        ]),
        date: new FormControl(this.data.location?.date, [Validators.required]),
        screen: new FormControl(this.data.location?.screen),
        tag: new FormControl(this.data.location?.tag)
    })
    public today: Date = new Date();
    public discordUsers: Array<DiscordUser> = [];

    constructor(
        private _dialogRef: MatDialogRef<EditLocationModalComponent, void>,
        @Inject(MAT_DIALOG_DATA) public data: {
            isCreate: boolean,
            location?: CLocation,
            list: Array<CLocation>
        },
        private _validatorsService: ValidatorsService,
        private _snackbarService: SnackbarService,
        private _discordService: DiscordService,
        private _serverService: ServerService,
        private _locationService: LocationService
    ) {
        this._serverService.getCurrentServer().then((result: CServer) => {
            this.server = result;
            this._discordService.getChannelUsers(this.server).then((discordUsers: Array<DiscordUser>) =>
                this.discordUsers = discordUsers
            );
        });
    }

    public saveLocation(): void {
        if (this.form.invalid) {
            return;
        }

        if (this.data.isCreate) {
            const location = new CLocation({
                server: this.server as CServer,
                name: this.form.controls.name.value,
                date: this.form.controls.date.value,
                screen: this.form.controls.screen.value,
                tag: this.form.controls.tag.value
            });

            this._locationService.add(new CLocation(location)).then(() => this._dialogRef.close());
        } else if (this.data.location) {
            this.data.location.name = this.form.controls.name.value;
            this.data.location.date = this.form.controls.date.value;
            this.data.location.screen = this.form.controls.screen.value;
            this.data.location.tag = this.form.controls.tag.value;

            this._locationService.edit(this.data.location).then(() => this._dialogRef.close());
        } else {
            this._snackbarService.openCustomError("Invalid type");
        }
    }

}