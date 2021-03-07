import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { CLaboratory } from '@interfaces/laboratory.class';
import { SnackbarService } from './snackbar.service';
import { MainService } from './main.service';
import { CStock } from '@interfaces/stock.class';

@Injectable({
    providedIn: 'root'
})
export class LaboratoryService extends MainService<CLaboratory, ILaboratory> {

    constructor(protected _http: HttpClient, protected _snackbarService: SnackbarService) {
        super('labo', CLaboratory, _http, _snackbarService);
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