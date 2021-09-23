import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { GlobalConfig } from '@global/config';
import { DiscordRole, DiscordUser } from '@global/interfaces/discord.interface';
import { DiscordService } from '@services/discord.service';
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
    public discordUserId: string | undefined;
    public discordRoles: Array<DiscordRole> = [];
    public discordUsers: Array<DiscordUser> = [];
    public productionTime = GlobalConfig.productions.timeoutMinutes;

    constructor(
        private _dialogRef: MatDialogRef<SettingsModalComponent, void>,
        private _serverService: ServerService,
        public discordService: DiscordService
    ) {
        _serverService.getCurrentServer().then((server) => {
            this.server = server;
            this.form.setControl('reminder', new FormControl(this.server.reminder, [Validators.required, Validators.min(0), Validators.max(59)]));
            this.form.setControl('tag', new FormControl(this.server.roleTag));

            this.discordService.getRoles(server).then((discordRoles: Array<DiscordRole>) =>
                this.discordRoles.push(...discordRoles)
            );

            this.discordService.getChannelUsers(server).then((discordUsers: Array<DiscordUser>) =>
                this.discordUsers.push(...discordUsers)
            );
        });
        this.refreshDiscordUserId();
    }

    public refreshDiscordUserId(): void {
        this.discordUserId = this.discordService.getUserId();
    }

    public saveSettings(): void {
        if (this.form.invalid || this.form.pristine) {
            return;
        }

        const promises: Array<Promise<CServer>> = [];

        if (this.server?.reminder !== this.form.controls.reminder.value) {
            promises.push(this._serverService.setReminder(this.form.controls.reminder.value));
        }

        if (this.server?.roleTag !== this.form.controls.tag.value) {
            promises.push(this._serverService.setRoleTag(this.form.controls.tag.value));
        }

        Promise.all(promises).then(() => this._dialogRef.close());
    }

}