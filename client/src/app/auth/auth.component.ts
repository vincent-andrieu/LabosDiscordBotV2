import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';

import { DiscordService } from '@services/discord.service';
import { ServerService } from '@services/server.service';
import { SnackbarService } from '@services/snackbar.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
    public loginForm = new FormGroup({});
    public isInit = false;

    constructor(
        private _router: Router,
        private _socket: Socket,
        private _discordService: DiscordService,
        private _serverService: ServerService,
        private _snackbarService: SnackbarService
    ) {
        setTimeout(() => {
            if (this._router.url.substr(1).includes("/")) {
                this._router.navigateByUrl(this._router.url.substr(1));
                return;
            }
            this.loginForm.setControl('serverId', new FormControl(this._router.url.substr(1) || "", Validators.required));
            this.loginForm.setControl('password', new FormControl("", Validators.required));
            this.isInit = true;
        }, 0);
    }

    public login(): void {
        const serverId: string = this.loginForm.controls.serverId.value;
        const password: string = this.loginForm.controls.password.value;

        this._serverService.login(serverId, password).then((result) => {
            if (result) {
                this._router.navigate([serverId, password, 'labos'])
                    .then(() => this._socket.emit('users.getId.callback', serverId, this._discordService.getUserId()))
                    .catch((err) => {
                        console.error(err);
                        this._snackbarService.openCustomError("Impossible d'accéder à l'URL");
                    });
            } else {
                this._snackbarService.openCustomError("Server ID ou password invalid");
            }
        });
    }

}