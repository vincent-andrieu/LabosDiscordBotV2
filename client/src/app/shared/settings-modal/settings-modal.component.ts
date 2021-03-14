import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ServerService } from '@services/server.service';
import { CServer } from '@interfaces/server.class';

@Component({
    selector: 'app-settings-modal',
    templateUrl: './settings-modal.component.html',
    styleUrls: ['./settings-modal.component.scss']
})
export class SettingsModalComponent {
    public server?: CServer;
    public form = new FormGroup({});

    constructor(private _dialogRef: MatDialogRef<SettingsModalComponent, void>, private _serverService: ServerService) {
        _serverService.getCurrentServer().then((server) => {
            this.server = server;
            this.form.setControl('reminder', new FormControl(this.server.reminder, [Validators.required, Validators.min(0), Validators.max(59)]));
        });
    }

    public saveSettings(): void {
        if (this.form.invalid || this.form.pristine) {
            return;
        }

        if (this.server?.reminder !== this.form.controls.reminder.value) {
            this._serverService.setReminder(this.form.controls.reminder.value).then(() => this._dialogRef.close());
        }
    }

}