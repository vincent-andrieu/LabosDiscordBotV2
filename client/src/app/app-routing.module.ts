import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Socket } from 'ngx-socket-io';

import { DiscordService } from '@services/discord.service';
import { SnackbarService } from '@services/snackbar.service';
import { ServerService } from '@services/server.service';
import { AdminService } from '@services/admin.service';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

@Injectable()
class AuthGuard implements CanActivate {
    constructor(private _router: Router, private _serverService: ServerService, private _snackbarService: SnackbarService) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const password: string = route.params.password;
        const serverId: string = route.params.serverId;

        return this._serverService.login(serverId, password).then((result) => {
            if (result) {
                return true;
            } else {
                this._snackbarService.openCustomError("Server ID ou password invalid");
                return this._router.parseUrl(`${serverId}`);
            }
        });
    }
}

@Injectable()
class AdminGuard implements CanActivate {
    constructor(
        private _router: Router,
        private _snackbarService: SnackbarService,
        private _adminService: AdminService
    ) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this._adminService.isInit) {
            return this._getRedirection();
        } else {
            return new Promise<boolean | UrlTree>((resolve, reject) => {
                this._adminService.onInit$.subscribe(() =>
                    resolve(this._getRedirection())
                , (err) => reject(err));
            });
        }
    }

    private _getRedirection(): boolean | UrlTree {
        if (this._adminService.isAdmin) {
            return true;
        } else {
            this._snackbarService.openCustomError("Permission denied");
            return this._router.parseUrl("/");
        }
    }
}

@Injectable()
class DiscordAuthResolver implements Resolve<void> {

    constructor(
        private _router: Router,
        private _socket: Socket,
        private _discordService: DiscordService,
        private _serverService: ServerService,
        private _snackbarService: SnackbarService
    ) {}

    resolve(route: ActivatedRouteSnapshot): void {
        const code: string = route.queryParams.code;
        const states: { serverId: string, password: string } | undefined = route.queryParams.state ? JSON.parse(route.queryParams.state) : undefined;

        if (code && states) {
            this._serverService.login(states.serverId, states.password).then((isValid: boolean) => {
                if (isValid) {
                    this._discordService.setToken(code, states.serverId)
                        .then(() => {
                            this._snackbarService.open("Compte discord associé");
                            this._router.navigate([states.serverId, states.password])
                                .then(() => this._socket.emit('users.getId.callback', states.serverId, this._discordService.getUserId()));
                        }).catch((err) => {
                            this._snackbarService.openError(err);
                            this._router.navigate([states.serverId, states.password]);
                        });
                } else {
                    this._snackbarService.openCustomError("Permission denied");
                    this._router.navigate([states.serverId]);
                }
            }).catch((err) => {
                this._snackbarService.openError(err);
                this._router.navigate([states.serverId]);
            });
        } else {
            if (states?.serverId) {
                this._router.navigate([states.serverId]);
            } else {
                this._router.navigate([]);
            }

        }
    }
}

const routes: Routes = [
    { path: '', component: AuthComponent },
    {
        path: 'auth/discord/redirect',
        component: AppComponent,
        resolve: {
            discordAuth: DiscordAuthResolver
        }
    },
    { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] },
    { path: ':serverId', component: AuthComponent },
    {
        path: ':serverId/:password',
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'labos'
            },
            { path: 'labos', component: HomeComponent },
            { path: 'stocks', component: HomeComponent },
            { path: 'locations', component: HomeComponent }
        ]
    },
    { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard, AdminGuard, DiscordAuthResolver]
})
export class AppRoutingModule {}