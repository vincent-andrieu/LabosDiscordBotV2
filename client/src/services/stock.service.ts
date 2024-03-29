import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { IStock } from '@global/interfaces/stock.interface';
import { CStock } from '@interfaces/stock.class';
import { MainService } from './main.service';
import { SnackbarService } from './snackbar.service';
import { ServerService } from './server.service';

@Injectable({
    providedIn: 'root'
})
export class StockService extends MainService<CStock, IStock> {

    constructor(protected _injector: Injector, protected _http: HttpClient, protected _snackbarService: SnackbarService, private _socket: Socket, private _serverService: ServerService) {
        super('stock', CStock, _injector);

        _socket.on(`stock.add`, (stock: IStock) => {
            this._snackbarService.open(`Entrepôt ${stock.name} ajouté`);
        });

        _socket.on(`stock.del`, (stock: IStock) => {
            this._snackbarService.open(`Entrepôt ${stock.name} supprimé`);
        });

        _socket.on(`stock.edit`, (stockObj: { stock: IStock, doesPrintMsg: boolean }) => {
            if (stockObj.doesPrintMsg) {
                this._snackbarService.open(`Entrepôt ${stockObj.stock.name} modifié`);
            }
        });
    }

    /**
     * Return the edited stock
     * @param  {CStock} stock
     * @returns Promise
     */
    public addStockQuantity(stock: CStock, quantity: number): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/addStock`, {
                userId: this._discordService.getUserId(),
                stock: stock,
                quantity: quantity
            }).subscribe((result: IStock) =>
                resolve(new CStock(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    /**
     * Return the edited stock
     * @param  {CStock} stock
     * @returns Promise
     */
    public delStockQuantity(stock: CStock, quantity: number): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/delStock`, {
                userId: this._discordService.getUserId(),
                stock: stock,
                quantity: quantity
            }).subscribe((result: IStock) =>
                resolve(new CStock(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    /**
     * Return the edited stock
     * @param  {CStock} stock
     * @returns Promise
     */
    public setStockQuantity(stock: CStock, quantity: number): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/setStock`, {
                userId: this._discordService.getUserId(),
                stock: stock,
                quantity: quantity
            }).subscribe((result: IStock) =>
                resolve(new CStock(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}