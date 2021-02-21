import { Component } from '@angular/core';
import { MatSidenav, MatDrawerToggleResult } from '@angular/material/sidenav';
import { Location } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie';

import { EPageStatus } from '@interfaces/root.interface';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public ePageStatus = EPageStatus;
    public pageStatus: { index: number; status: EPageStatus } = { index: 0, status: EPageStatus.LABOS };
    public sidenavStatus = true;

    constructor(
        private _cookieService: CookieService,
        private _location: Location) {

        const pageCookieStatus = _cookieService.getObject(environment.cookiesName.pageStatus) as { index: number; status: EPageStatus };
        const sidenavCookieStatus: MatDrawerToggleResult | undefined = _cookieService.get(environment.cookiesName.sidenavStatus) as MatDrawerToggleResult;

        if (pageCookieStatus) {
            this.pageStatus = pageCookieStatus;
        }
        if (sidenavCookieStatus) {
            this.sidenavStatus = sidenavCookieStatus === 'open';
        }
    }

    public toggleSidenav(drawer: MatSidenav): void {
        drawer.toggle().then((status: MatDrawerToggleResult) => {
            this._cookieService.put(environment.cookiesName.sidenavStatus, status);
        });
    }

    public onTabChange(tab: MatTabChangeEvent): void {
        this.pageStatus = { index: tab.index, status: (tab.tab.ariaLabel as EPageStatus) };
        this._location.go(this.pageStatus.status);
        this._cookieService.putObject(environment.cookiesName.pageStatus, this.pageStatus);
    }
}