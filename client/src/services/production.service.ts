import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IProductions } from '@global/interfaces/production.interface';
import { CProductions } from '@interfaces/production.class';
import { MainService } from './main.service';
import { SnackbarService } from './snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class ProductionService extends MainService<CProductions, IProductions> {

    constructor(protected _http: HttpClient, protected _snackbarService: SnackbarService) {
        super('prod', CProductions, _http, _snackbarService);
    }
}