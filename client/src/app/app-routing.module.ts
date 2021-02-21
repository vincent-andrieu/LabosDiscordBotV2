import { Injectable, NgModule } from '@angular/core';
import { Resolve, Router, RouterModule, Routes } from '@angular/router';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie';

import { EPageStatus } from '@interfaces/root.interface';
import { environment } from 'environments/environment';
import { LabosListComponent } from './labos-list/labos-list.component';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { AppComponent } from './app.component';

@Injectable({
    providedIn: "root"
})
class RootResolver implements Resolve<void> {

    constructor(
        private _cookieService: CookieService,
        private _location: Location,
    private _router: Router) {}

    resolve(): void {
        const pageCookieStatus = this._cookieService.getObject(environment.cookiesName.pageStatus) as { index: number; status: EPageStatus } | undefined;

        this._router.navigate([pageCookieStatus?.status || EPageStatus.LABOS]);
    }
}

const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        resolve: {
            redirect: RootResolver
        }
    },
    { path: 'labos', component: LabosListComponent },
    { path: 'stocks', component: StocksListComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [RootResolver]
})
export class AppRoutingModule {}