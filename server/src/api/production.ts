import { Express } from 'express';
import { Server } from 'socket.io';

import { ProductionSchema } from '@schemas/productions.schema';
import { IProdFinish } from '@global/interfaces/production.interface';
import { CProductions } from '@interfaces/production.class';

export class ProductionHttp {

    private _urlBase = '/prod';
    private _productionSchema: ProductionSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._productionSchema = new ProductionSchema();
        this._init();
    }

    private _init(): void {

        // Add prod
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const prod: CProductions = new CProductions(request.body);

            this._productionSchema.add(prod).then(() => {
                response.send(prod);
            }).catch((err) => response.send(err));
        });

        // Delete prod
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const prod: CProductions = new CProductions(JSON.parse(request.query.value as string));

            this._productionSchema.deleteById(prod).then(() => {
                response.send(prod);
            }).catch((err) => response.send(err));
        });

        // Edit prod
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const prod: CProductions = new CProductions(request.body);

            this._productionSchema.edit(prod).then((editedProd: CProductions) => {
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
            const prod: CProductions = new CProductions(request.body);

            this._productionSchema.finishProd(prod).then((finishProd: IProdFinish) => {
                response.send(finishProd);
            }).catch((err) => response.send(err));
        });
    }
}