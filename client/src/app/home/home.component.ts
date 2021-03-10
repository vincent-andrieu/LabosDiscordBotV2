import { Component } from '@angular/core';
import { MatSidenav, MatDrawerToggleResult } from '@angular/material/sidenav';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CookieService } from 'ngx-cookie';

import { EPageStatus } from '@interfaces/root.interface';
import { environment } from '@environment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    public ePageStatus = EPageStatus;
    public pageStatus: { index: number; status: EPageStatus } = { index: 0, status: EPageStatus.LABOS };
    public sidenavStatus = true;

    constructor(
        private _cookieService: CookieService,
        private _location: Location,
    private _router: Router) {

        const sidenavCookieStatus: MatDrawerToggleResult | undefined = _cookieService.get(environment.cookiesName.sidenavStatus) as MatDrawerToggleResult;
        const urlSegments = this._router.parseUrl(this._router.url).root.children.primary.segments;

        if (sidenavCookieStatus) {
            this.sidenavStatus = sidenavCookieStatus === 'open';
        }

        this.pageStatus = { index: urlSegments[2].path === EPageStatus.LABOS ? 0 : 1, status: urlSegments[2].path as EPageStatus };
    }

    public toggleSidenav(drawer: MatSidenav): void {
        drawer.toggle().then((status: MatDrawerToggleResult) => {
            this._cookieService.put(environment.cookiesName.sidenavStatus, status);
        });
    }

    public onTabChange(tab: MatTabChangeEvent): void {
        this.pageStatus = { index: tab.index, status: (tab.tab.ariaLabel as EPageStatus) };
        const urlSegments = this._router.parseUrl(this._router.url).root.children.primary.segments;
        this._location.go(`${urlSegments[0].path}/${urlSegments[1].path}/${this.pageStatus.status}`);
        this._cookieService.putObject(environment.cookiesName.pageStatus, this.pageStatus);
    }

}