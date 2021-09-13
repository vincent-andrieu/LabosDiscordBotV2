import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ServerService } from '@services/server.service';
import { SnackbarService } from '@services/snackbar.service';
import { AdminService } from '@services/admin.service';

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
        private _serverService: ServerService,
        private _snackbarService: SnackbarService,
        private _adminService: AdminService
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

    public get isAdmin(): boolean {
        return this._adminService.isAdmin;
    }

    public login(): void {
        const serverId: string = this.loginForm.controls.serverId.value;
        const password: string = this.loginForm.controls.password.value;

        this._serverService.login(serverId, password).then((result) => {
            if (result) {
                this._router.navigate([serverId, password])
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