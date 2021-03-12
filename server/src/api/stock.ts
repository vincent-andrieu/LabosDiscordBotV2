import { Express } from 'express';
import { Server } from 'socket.io';

import { StockSchema } from '@schemas/stocks.schema';
import { CStock } from '@interfaces/stock.class';

export class StockHttp {

    private _urlBase = '/stock';
    private _stockSchema: StockSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._stockSchema = new StockSchema();
        this._init();
    }

    private _init(): void {

        // Add stock
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const stock: CStock = new CStock(request.body);

            this._stockSchema.add(stock).then((newStock: CStock) => {
                response.send(newStock);
            }).catch((err) => response.send(err));
        });

        // Delete stock
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const stock: CStock = new CStock(JSON.parse(request.query.value as string));

            this._stockSchema.delete(stock).then(() => {
                response.send(stock);
            }).catch((err) => response.send(err));
        });

        // Edit stock
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const stock: CStock = new CStock(request.body);

            this._stockSchema.edit(stock).then((editedStock: CStock | void) => {
                response.send(editedStock || stock);
            }).catch((err) => response.send(err));
        });

        // Get stocks
        this._app.get(`${this._urlBase}/get`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._stockSchema.getByServerId(serverId).then((stocks) => {
                response.send(stocks);
            }).catch((err) => response.send(err));
        });

        // Add stock quantity
        this._app.post(`${this._urlBase}/addStock`, (request, response) => {
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.addStockQty(stock, quantity).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });

        // Del stock quantity
        this._app.post(`${this._urlBase}/delStock`, (request, response) => {
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.removeStockQty(stock, quantity).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });

        // Set stock quantity
        this._app.post(`${this._urlBase}/setStock`, (request, response) => {
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.setStockQty(stock, quantity).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });
    }
}