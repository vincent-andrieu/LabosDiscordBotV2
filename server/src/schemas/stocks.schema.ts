import mongoose = require('mongoose');

import { CStock, IStock } from '@global/interfaces/stock.interface';
import { CServer } from '@global/interfaces/server.interface';
import { getDrugError, isADrugOrStuff } from '@global/utils';
import { ObjectId } from '@global/interfaces/database.interface';
import { GlobalConfig } from '@global/config';
import { CLaboratory } from '@global/interfaces/laboratory.interface';

const stockSchema = new mongoose.Schema({
    server: { type: ObjectId, ref: 'servers' },
    name: { type: String, required: true },
    drug: { type: String, required: true },
    quantity: { type: Number, required: false, default: 0 },
    screen: { type: String, required: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

function autoPopulate(this: any, next: any) {
    this.populate('server');
    next();
}

export class StockSchema {
    private _model = mongoose.model('laboratories', stockSchema);

    public add(stock: CStock): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (!isADrugOrStuff(stock.drug)) {
                return reject(getDrugError({ drug: true, stuff: true }, stock.drug));
            }
            if (!stock.server) {
                return reject("No link to server");
            }

            this._model.findOne({
                server: stock.server._id,
                name: { $regex: new RegExp(stock.name, 'i') }
            }).then((currentStock: IStock) => {
                if (currentStock) {
                    return reject("Un entrepôt existe déjà sous le nom " + currentStock.name);
                }

                if (stock._id) {
                    delete stock._id;
                }

                this._model.create(stock)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public edit(stock: CStock): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._model.findByIdAndUpdate(stock._id, stock)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    public findOneByName(server: CServer, name: string, ignoreCase?: boolean): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.findOne({
                server: server._id,
                name: search
            })
                .then((result: IStock) => {
                    if (!result) {
                        return reject("Aucun entrepôt existe sous le nom " + name);
                    }
                    resolve(new CStock(result));
                })
                .catch((err) => reject(err));
        });
    }

    public findByName(server: CServer, name: string, ignoreCase?: boolean): Promise<Array<CStock>> {
        return new Promise<Array<CStock>>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.find({
                server: server._id,
                name: search
            })
                .then((res: Array<IStock>) => {
                    if (res.length == 0) {
                        return reject("Aucun entrepôt existe sous le nom " + name);
                    }
                    resolve(res.map((labo) => new CStock(labo)));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get stock by its id. Return an error if it doesn't exist.
     * @param  {ObjectId} id
     * @returns Promise
     */
    public getById(stock: CStock): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            this._model.findById(stock._id)
                .then((result: IStock) => {
                    if (!result) {
                        return reject("L'entrepôt " + stock.name + " n'existe pas");
                    }
                    resolve(new CStock(result));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get an array of server's stocks. Do NOT return an error if it doesn't have any stock.
     * @param  {CServer} server
     * @returns Promise
     */
    public getByServer(server: CServer): Promise<Array<CStock>> {
        return new Promise<Array<CStock>>((resolve, reject) => {
            this._model.find({ server: server._id })
                .then((result: Array<IStock>) => resolve(result.map((labo) => new CStock(labo))))
                .catch((err) => reject(err));
        });
    }

    public delete(stock: CStock): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: stock.server._id, _id: stock._id })
                .then((res) => {
                    if (res.deletedCount <= 0) {
                        return reject("L'entrepôt " + stock.name + " n'existe pas");
                    }
                    resolve(res.deletedCount);
                })
                .catch((err) => reject(err));
        });
    }

    public deleteByName(server: CServer, name: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: server._id, name: name })
                .then((res) => {
                    if (res.deletedCount <= 0) {
                        return reject("Aucun entrepôt existe sous le nom " + name);
                    }
                    resolve(res.deletedCount);
                })
                .catch((err) => reject(err));
        });
    }

    public addStockQty(stock: CStock, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findByIdAndUpdate(stock._id, { $inc: { quantity: quantity } })
                .then(() => resolve())
                .catch((err) => reject(err));

        });
    }

    public addStockQtyByName(server: CServer, name: string, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.addStockQty(stock, quantity)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err))
        );
    }

    public removeStockQty(stock: CStock, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findOneAndUpdate({ _id: stock._id, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } })
                .then(() => resolve())
                .catch((err) => reject(err));

        });
    }

    public removeStockQtyByName(server: CServer, name: string, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.removeStockQty(stock, quantity)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err))
        );
    }

    public setStockQty(stock: CStock, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            this._model.findByIdAndUpdate(stock._id, { quantity: quantity })
                .then(() => resolve())
                .catch((err) => reject(err));

        });
    }

    public setStockQtyByName(server: CServer, name: string, quantity: number): Promise<void> {
        return new Promise<void>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.setStockQty(stock, quantity)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err))
        );
    }

    public removeProdStock(labo: CLaboratory, prodQty: number): Promise<Array<void>> {
        return new Promise<Array<void>>((resolve, reject) => {
            let tablesQty: number;
            const updatesList: Array<Promise<void>> = [];

            labo.stocks.forEach((stock) => {
                if (stock.drug === labo.drug) {
                    return;
                }
                const stockConfig = GlobalConfig.productions.drugs[labo.drug].recipe.find((stuffConfig) => stuffConfig.name === stock.drug);
                if (!stockConfig) {
                    return reject("drug name incorrect to '" + stock.drug + "'");
                }
                if (!stockConfig.needAll) {
                    tablesQty = Math.ceil(prodQty / stockConfig.quantity);
                }
                if (stockConfig.needAll && !tablesQty) {
                    tablesQty = GlobalConfig.productions.drugs[labo.drug].table;
                }
                updatesList.push(this.removeStockQty(stock, stockConfig.needAll ? stockConfig.quantity * tablesQty : prodQty));
            });

            Promise.all(updatesList).then(resolve).catch(reject);
        });
    }
}