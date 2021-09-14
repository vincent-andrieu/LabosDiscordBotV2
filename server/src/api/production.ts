import { Express } from 'express';

import { atob } from '@global/utils';
import { ProductionSchema } from '@schemas/productions.schema';
import { IProdFinish } from '@global/interfaces/production.interface';
import { CProductions } from '@interfaces/production.class';
import Sockets from 'init/sockets';

export class ProductionHttp {

    private _urlBase = '/prod';
    private _productionSchema: ProductionSchema;

    constructor(private _app: Express, _socketService: Sockets) {
        this._productionSchema = new ProductionSchema(_socketService);
        this._init();
    }

    private _init(): void {

        // Add prod
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const userId: string = request.query.userId as string;
            const prod: CProductions = new CProductions(request.body);

            this._productionSchema.add(prod, atob(userId)).then(() => {
                response.send(prod);
            }).catch((err) => response.send(err));
        });

        // Delete prod
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const userId: string = request.query.userId as string;
            const prod: CProductions = new CProductions(JSON.parse(request.query.value as string));

            this._productionSchema.deleteById(prod, undefined, atob(userId)).then(() => {
                response.send(prod);
            }).catch((err) => response.send(err));
        });

        // Edit prod
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const userId: string = request.query.userId as string;
            const prod: CProductions = new CProductions(request.body);

            this._productionSchema.edit(prod, atob(userId)).then((editedProd: CProductions) => {
                response.send(editedProd || prod);
            }).catch((err) => response.send(err));
        });

        // Get prods
        this._app.get(`${this._urlBase}/get`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._productionSchema.getByServerId(serverId).then((prods) => {
                response.send(prods);
            }).catch((err) => response.send(err));
        });

        // Finish prod
        this._app.post(`${this._urlBase}/finish`, (request, response) => {
            const userId: string | undefined = request.body.userId;
            const prod: CProductions = new CProductions(request.body.prod);

            this._productionSchema.finishProd(prod, atob(userId)).then((finishProd: IProdFinish) => {
                response.send(finishProd);
            }).catch((err) => response.send(err));
        });
    }
}