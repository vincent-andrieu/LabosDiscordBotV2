import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';
import { MainService } from './main.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class LaboratoryService extends MainService<CLaboratory, ILaboratory> {

    constructor(
        protected _injector: Injector,
        protected _http: HttpClient,
        _socket: Socket,
        private _serverService: ServerService
    ) {
        super('labo', CLaboratory, _injector);

        _socket.on(`labo.add`, (labo: ILaboratory) => {
            this._snackbarService.open(`Laboratoire ${labo.name} ajouté`);
        });

        _socket.on(`labo.del`, (labo: ILaboratory) => {
            this._snackbarService.open(`Laboratoire ${labo.name} supprimé`);
        });

        _socket.on(`labo.edit`, (labo: ILaboratory) => {
            this._snackbarService.open(`Laboratoire ${labo.name} modifié`);
        });

        _socket.on(`labo.addStock`, (labo: ILaboratory) => {
            this._snackbarService.open(`Entrepôt ajouté au laboratoire ${labo.name}`);
        });

        _socket.on(`labo.delStock`, (labo: ILaboratory) => {
            this._snackbarService.open(`Entrepôt supprimé du laboratoire ${labo.name}`);
        });

        _socket.on(`labo.default`, (labo: ILaboratory) => {
            this._snackbarService.open(`Nouveau laboratoire par défaut : ${labo.name}`);
        });
    }

    /**
     * Return the laboratory with the added stock
     * @param  {CLaboratory} labo
     * @param  {CStock} stock
     * @returns Promise
     */
    public addStock(labo: CLaboratory, stock: CStock): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            this._http.put<ILaboratory>(`${this._serverUrl}/addStock`, {
                userId: this._discordService.getUserId(),
                labo: labo,
                stock: stock
            }).subscribe((result: ILaboratory) =>
                resolve(new CLaboratory(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    /**
     * Return the laboratory without the deleted stock
     * @param  {CLaboratory} labo
     * @param  {CStock} stock
     * @returns Promise
     */
    public delStock(labo: CLaboratory, stock: CStock): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            this._http.delete<ILaboratory>(`${this._serverUrl}/delStock`, {
                params: {
                    userId: this._discordService.getUserId() || '',
                    labo: JSON.stringify(labo),
                    stock: JSON.stringify(stock)
                }
            }).subscribe((result: ILaboratory) =>
                resolve(new CLaboratory(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    /**
     * Return the new default laboratory
     * @param  {CLaboratory} labo
     * @returns Promise
     */
    public setDefault(labo: CLaboratory): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            this._http.post<ILaboratory>(`${this._serverUrl}/setDefault`, {
                userId: this._discordService.getUserId(),
                labo: labo
            }).subscribe((result: ILaboratory) =>
                resolve(new CLaboratory(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}