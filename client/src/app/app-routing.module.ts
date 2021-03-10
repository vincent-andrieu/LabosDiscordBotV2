import { Injectable, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { ServerService } from '@services/server.service';
import { SnackbarService } from '@services/snackbar.service';
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

const routes: Routes = [
    // { path: '**', redirectTo: '/' },
    { path: '', component: AuthComponent },
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
    providers: [AuthGuard]
})
export class AppRoutingModule {}