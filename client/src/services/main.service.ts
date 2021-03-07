import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ClassType } from 'class-transformer/ClassTransformer';

import { environment } from "@environment";
import { SnackbarService } from "./snackbar.service";


export class MainService<C, I> {

    protected _serverUrl: string;

    constructor(private _serverUrlBase: string, private _ctor: ClassType<C>, protected _http: HttpClient, protected _snackbarService: SnackbarService) {
        this._serverUrl = `${environment.server.url}/${_serverUrlBase}`;
    }

    public add(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.put<I>(`${this._serverUrl}/add`, param).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }

    public del(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.delete<I>(`${this._serverUrl}/delete`, { params: { value: JSON.stringify(param) } }).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });

        });
    }

    public edit(param: C): Promise<C> {
        return new Promise<C>((resolve, reject) => {
            this._http.post<I>(`${this._serverUrl}/edit`, param).subscribe((result: I) =>
                resolve(new this._ctor(result))
            , (err: HttpErrorResponse) => {
                this._snackbarService.openError(err);
                reject(err);
            });
        });
    }
}