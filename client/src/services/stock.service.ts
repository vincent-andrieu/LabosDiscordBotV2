import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IStock } from '@global/interfaces/stock.interface';
import { CStock } from '@interfaces/stock.class';
import { MainService } from './main.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class StockService extends MainService<CStock, IStock> {

    constructor(protected _http: HttpClient, protected _snackbarService: SnackbarService) {
        super('stock', CStock, _http, _snackbarService);
    }

    /**
     * Return the edited stock
     * @param  {CStock} stock
     * @returns Promise
     */
    public addStockQuantity(stock: CStock): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/addStock`, {
                stock: stock
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
    public delStockQuantity(stock: CStock): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/delStock`, {
                stock: stock
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
    public setStockQuantity(stock: CStock): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._http.post<IStock>(`${this._serverUrl}/setStock`, {
                stock: stock
            }).subscribe((result: IStock) =>
                resolve(new CStock(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}