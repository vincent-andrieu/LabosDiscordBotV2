import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { IServer } from '@global/interfaces/server.interface';
import { IProdFinish, IProductions } from '@global/interfaces/production.interface';
import { CProductions } from '@interfaces/production.class';
import { MainService } from './main.service';
import { SnackbarService } from './snackbar.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class ProductionService extends MainService<CProductions, IProductions> {

    constructor(protected _injector: Injector, protected _http: HttpClient, protected _snackbarService: SnackbarService, private _socket: Socket, private _serverService: ServerService) {
        super('prod', CProductions, _injector);

        _socket.on(`prod.add`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this._snackbarService.open(`Production ajoutée au laboratoire ${prod.labo.name}`);
            }
        });

        _socket.on(`prod.del`, (prod: IProductions | IServer) => {
            if ((prod as IProductions)?.server._id === this._serverService.getCurrentServerId()) {
                this._snackbarService.open(`Production supprimée du laboratoire ${(prod as IProductions).labo.name}`);
            } else if (prod._id === this._serverService.getCurrentServerId()) {
                this._snackbarService.open(`Production supprimée`);
            }
        });

        _socket.on(`prod.reminder`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this._snackbarService.open(`Production du laboratoire ${prod.labo.name} terminée dans ${prod.server.reminder} min`);
            }
        });

        _socket.on(`prod.finish`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this._snackbarService.open(`Production du laboratoire ${prod.labo.name} terminée`);
            }
        });
    }

    public finish(prod: CProductions): Promise<IProdFinish> {
        return new Promise<IProdFinish>((resolve, reject) => {
            this._http.post<IProdFinish>(`${this._serverUrl}/finish`, {
                userId: this._discordService.getUserId(),
                prod: prod
            }).subscribe((result: IProdFinish) =>
                resolve(result)
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}