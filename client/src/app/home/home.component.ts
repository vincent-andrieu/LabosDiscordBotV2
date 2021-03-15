import { Component } from '@angular/core';
import { MatSidenav, MatDrawerToggleResult } from '@angular/material/sidenav';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { ServerService } from '@services/server.service';
import { ProductionService } from '@services/production.service';
import { EPageStatus } from '@interfaces/root.interface';
import { CProductions } from '@interfaces/production.class';
import { environment } from '@environment';
import { IProductions } from '@global/interfaces/production.interface';
import { IServer } from '@global/interfaces/server.interface';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    public ePageStatus = EPageStatus;
    public pageStatus: { index: number; status: EPageStatus } = { index: 0, status: EPageStatus.LABOS };
    public sidenavStatus = true;
    public serverName?: string;
    private _productions: Array<CProductions> = [];
    public prodsIsLoading = true;

    constructor(
        private _serverService: ServerService,
        private _productionService: ProductionService,
        private _cookieService: CookieService,
        private _location: Location,
        private _router: Router,
        private _socket: Socket,
        private _title: Title
    ) {

        const sidenavCookieStatus: MatDrawerToggleResult | undefined = _cookieService.get(environment.cookiesName.sidenavStatus) as MatDrawerToggleResult;
        const urlSegments = this._router.parseUrl(this._router.url).root.children.primary.segments;

        if (sidenavCookieStatus) {
            this.sidenavStatus = sidenavCookieStatus === 'open';
        }

        this.pageStatus = { index: urlSegments[2].path === EPageStatus.LABOS ? 0 : 1, status: urlSegments[2].path as EPageStatus };

        _serverService.getServerName().then((name: string | undefined) => {
            if (name) {
                _title.setTitle(name);
                this.serverName = name;
            }
        });

        this._updateProductions();

        _socket.on(`prod.add`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this._productions.push(new CProductions(prod));
            }
        });

        _socket.on(`prod.del`, (prod: IProductions | IServer) => {
            if ((prod as IProductions)?.server._id === this._serverService.getCurrentServerId()) {
                this._productions.remove((prodElem) => prodElem._id === prod._id);
            } else if (prod._id === this._serverService.getCurrentServerId()) {
                this._updateProductions();
            }
        });

        _socket.on(`prod.finish`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this._updateProductions();
            }
        });
    }

    private _updateProductions(): void {
        this._productionService.get().then((prods) => {
            this._productions = prods;
            this.prodsIsLoading = false;
        });
    }

    private _isProdFinish(prod: CProductions): boolean {
        return moment(prod.finishDate).isBefore(moment.now());
    }

    public getNumberFinishProds(): number {
        if (this.prodsIsLoading) {
            return 0;
        }
        return this._productions.filter((prod) => this._isProdFinish(prod)).length;
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
    }

}