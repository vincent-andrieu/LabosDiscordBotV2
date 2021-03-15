import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { DiscordService } from '@services/discord.service';
import { SnackbarService } from '@services/snackbar.service';
import { ServerService } from '@services/server.service';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';

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
class DiscordAuthResolver implements Resolve<void> {

    constructor(
        private _discordService: DiscordService,
        private _serverService: ServerService,
        private _snackbarService: SnackbarService,
        private _router: Router
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
                            this._router.navigate([states.serverId, states.password]);
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
    // { path: '**', redirectTo: '/' },
    { path: '', component: AuthComponent },
    {
        path: 'auth/discord/redirect',
        component: AppComponent,
        resolve: {
            discordAuth: DiscordAuthResolver
        }
    },
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
            { path: 'stocks', component: HomeComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard, DiscordAuthResolver]
})
export class AppRoutingModule {}