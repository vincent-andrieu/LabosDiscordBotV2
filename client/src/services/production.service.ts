import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { IServer } from '@global/interfaces/server.interface';
import { IProductions } from '@global/interfaces/production.interface';
import { CProductions } from '@interfaces/production.class';
import { MainService } from './main.service';
import { SnackbarService } from './snackbar.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class ProductionService extends MainService<CProductions, IProductions> {

    constructor(protected _http: HttpClient, protected _snackbarService: SnackbarService, private _socket: Socket, private _serverService: ServerService) {
        super('prod', CProductions, _http, _snackbarService);

        _socket.on(`prod.add`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getServerId()) {
                this._snackbarService.open(`Production ajoutée au laboratoire ${prod.labo.name}`);
            }
        });

        _socket.on(`prod.del`, (prod: IProductions | IServer) => {
            if ((prod as IProductions)?.server._id === this._serverService.getServerId()) {
                this._snackbarService.open(`Production supprimée du laboratoire ${(prod as IProductions).labo.name}`);
            } else if (prod._id === this._serverService.getServerId()) {
                this._snackbarService.open(`Production supprimée`);
            }
        });

        _socket.on(`prod.reminder`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getServerId()) {
                this._snackbarService.open(`Production du laboratoire ${prod.labo.name} terminée dans ${prod.server.reminder} min`);
            }
        });

        _socket.on(`prod.finish`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getServerId()) {
                this._snackbarService.open(`Production du laboratoire ${prod.labo.name} terminée`);
            }
        });
    }
}