import { Express } from 'express';

import { atob } from '@global/utils';
import { StockSchema } from '@schemas/stocks.schema';
import { CStock } from '@interfaces/stock.class';
import Sockets from 'init/sockets';

export class StockHttp {

    private _urlBase = '/stock';
    private _stockSchema: StockSchema;

    constructor(private _app: Express, _socketService: Sockets) {
        this._stockSchema = new StockSchema(_socketService);
        this._init();
    }

    private _init(): void {

        // Add stock
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const userId: string = request.query.userId as string;
            const stock: CStock = new CStock(request.body);

            this._stockSchema.add(stock, atob(userId)).then((newStock: CStock) => {
                response.send(newStock);
            }).catch((err) => response.send(err));
        });

        // Delete stock
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const userId: string = request.query.userId as string;
            const stock: CStock = new CStock(JSON.parse(request.query.value as string));

            this._stockSchema.delete(stock, undefined, atob(userId)).then(() => {
                response.send(stock);
            }).catch((err) => response.send(err));
        });

        // Edit stock
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const userId: string = request.query.userId as string;
            const stock: CStock = new CStock(request.body);

            this._stockSchema.edit(stock, atob(userId)).then((editedStock: CStock | void) => {
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
            const userId: string | undefined = request.body.userId;
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.addStockQty(stock, quantity, undefined, atob(userId)).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });

        // Del stock quantity
        this._app.post(`${this._urlBase}/delStock`, (request, response) => {
            const userId: string | undefined = request.body.userId;
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.removeStockQty(stock, quantity, undefined, atob(userId)).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });

        // Set stock quantity
        this._app.post(`${this._urlBase}/setStock`, (request, response) => {
            const userId: string | undefined = request.body.userId;
            const stock: CStock = new CStock(request.body.stock);
            const quantity: number = request.body.quantity;

            this._stockSchema.setStockQty(stock, quantity, undefined, atob(userId)).then((editedStock: CStock) => {
                response.send(editedStock);
            }).catch((err) => response.send(err));
        });
    }
}