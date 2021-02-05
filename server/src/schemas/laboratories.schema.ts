import mongoose = require('mongoose');

import { ObjectId } from "@global/interfaces/database.interface";
import { CLaboratory, ILaboratory } from "@global/interfaces/laboratory.interface";
import { CServer } from '@global/interfaces/server.interface';
import { CStock } from '@global/interfaces/stock.interface';
import { GlobalConfig } from '@global/config';
import { getDrugError, isADrug } from '@global/utils';
import { ServerSchema } from './servers.schema';
import { StockSchema } from './stocks.schema';

const laboSchema = new mongoose.Schema({
    server: { type: ObjectId, ref: 'servers', required: true },
    name: { type: String, required: true },
    drug: { type: String, required: true },
    stocks: [
        { type: ObjectId, ref: 'stocks' }
    ],
    screen: { type: String, required: false }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

laboSchema.virtual('quantity').get(function(this: ILaboratory) {
    const drugStock = this.stocks?.find((stock) => stock.drug === this.drug);
    return drugStock?.quantity || 0;
});

function autoPopulate(this: any, next: any) {
    this.populate('server');
    this.populate('stocks');
    next();
}

export class LaboratorySchema {
    private _model = mongoose.model('laboratories', laboSchema);

    public add(labo: CLaboratory): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (!isADrug(labo.drug)) {
                return reject(getDrugError({ drug: true }, labo.drug));
            }
            if (!labo.server) {
                return reject("No link to server");
            }

            this._model.findOne({
                server: labo.server._id,
                name: { $regex: new RegExp(labo.name, 'i') }
            }).then((currentLabo: ILaboratory) => {
                if (currentLabo) {
                    return reject("Un laboratoire existe déjà sous le nom " + currentLabo.name);
                }

                if (labo._id) {
                    delete labo._id;
                }

                this._model.create(labo)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public edit(labo: CLaboratory): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._model.findByIdAndUpdate(labo._id, labo)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    /**
     * Return a laboratory which match with the name.
     * Return an error if it doesn't exist with this name.
     * @param  {CServer} server
     * @param  {string} name
     * @param  {boolean} ignoreCase?
     * @returns Promise
     */
    public findOneByName(server: CServer, name: string, ignoreCase?: boolean): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.findOne({
                server: server._id,
                name: search
            })
                .then((result: ILaboratory) => {
                    if (!result) {
                        return reject("Aucun laboratoire existe sous le nom " + name);
                    }
                    resolve(new CLaboratory(result));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Return an array on laboratories which match with the name.
     * Return an error if any laboratory exist with this name.
     * @param  {CServer} server
     * @param  {string} name
     * @param  {boolean} ignoreCase?
     * @returns Promise
     */
    public findByName(server: CServer, name: string, ignoreCase?: boolean): Promise<Array<CLaboratory>> {
        return new Promise<Array<CLaboratory>>((resolve, reject) => {
            const search = ignoreCase ? { $regex: new RegExp(name, 'i') } : name;

            this._model.find({
                server: server._id,
                name: search
            })
                .then((res: Array<ILaboratory>) => {
                    if (res.length == 0) {
                        return reject("Aucun laboratoire existe sous le nom " + name);
                    }
                    resolve(res.map((labo) => new CLaboratory(labo)));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get laboratory by its id. Return an error if it doesn't exist.
     * @param  {CLaboratory} labo
     * @returns Promise
     */
    public getById(labo: CLaboratory): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            this._model.findById(labo._id)
                .then((result: ILaboratory) => {
                    if (!result) {
                        return reject("Le laboratoire " + labo.name + " n'existe pas");
                    }
                    resolve(new CLaboratory(result));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Get an array of server's laboratories. Do NOT return an error if it doesn't have any laboratory.
     * @param  {CServer} server
     * @returns Promise
     */
    public getByServer(server: CServer): Promise<Array<CLaboratory>> {
        return new Promise<Array<CLaboratory>>((resolve, reject) => {
            this._model.find({ server: server._id })
                .then((result: Array<ILaboratory>) => resolve(result.map((labo) => new CLaboratory(labo))))
                .catch((err) => reject(err));
        });
    }

    public delete(labo: CLaboratory): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: labo.server._id, _id: labo._id })
                .then((res) => {
                    if (res.deletedCount <= 0) {
                        return reject("Le laboratoire " + labo.name + " n'existe pas");
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
                        return reject("Aucun laboratoire existe sous le nom " + name);
                    }
                    resolve(res.deletedCount);
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Set default laboratory by name and checking if it exist
     * @param  {CServer} server
     * @param  {string} name
     * @returns Promise
     */
    public setDefaultLaboByName(server: CServer, name: string): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

            this.findOneByName(server, name, true).then((labo: CLaboratory) => {
                if (!labo) {
                    return reject("Aucun laboratoire existe sous le nom " + name);
                }

                new ServerSchema().forceSetDefaultLabo(labo)
                    .then(() => resolve(labo))
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));

        });
    }

    /**
     * Add a stock to a laboratory
     * @param  {CLaboratory} labo
     * @param  {CStock} stock
     * @returns Promise
     */
    public addLaboStock(labo: CLaboratory, stock: CStock): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            if (labo.server._id !== stock.server._id) {
                return reject("No same server");
            }

            this.getById(labo).then((crtLabo) => {
                // Check if laboratory is already link with to this stock
                if (crtLabo.stocks.find((stockIndex) => stockIndex._id === stock._id)) {
                    return reject("Le laboratoire " + labo.name + " est déjà relié à l'entrepôt " + stock.name);
                }

                new StockSchema().getById(stock).then((crtStock) => {

                    // Check if a stock of this drug already exist
                    const stockAlreadyExist = crtLabo.stocks.find((stockIndex) => stockIndex.drug === crtStock.drug);
                    if (stockAlreadyExist) {
                        return reject("L'entrepôt " + stockAlreadyExist.name + " de " + stockAlreadyExist.drug + " est déjà relié au laboratoire " + crtLabo.name);
                    }

                    // Check if laboratory need a stock of this drug
                    if (crtLabo.drug !== crtStock.drug && !GlobalConfig.productions.drugs[crtLabo.drug].recipe.find((stuffIndex) => stuffIndex.name === crtStock.drug)) {
                        return reject("Un entrepôt de " + crtStock.drug + " n'est pas nécessaire pour le laboratoire " + crtLabo.name);
                    }

                    this._model.findByIdAndUpdate(crtLabo._id, { $push: { stocks: crtStock._id } })
                        .then(() => resolve())
                        .catch((err) => reject(err));

                }).catch((err) => reject(err));
            }).catch((err) => reject(err));

        });
    }

    /**
     * Remove a stock from a laboratory. Do NOT check if labo & stock exist.
     * @param  {CLaboratory} labo
     * @param  {CStock} stock
     * @returns Promise
     */
    public delLaboStock(labo: CLaboratory, stock: CStock): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            this._model.findByIdAndUpdate(labo._id, { $pull: { stocks: stock._id } })
                .then(() => resolve())
                .catch((err) => reject(err));

        });
    }

    public delLaboStockByNames(server: CServer, laboName: string, stockName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            Promise.all([
                this.findOneByName(server, laboName),
                new StockSchema().findOneByName(server, stockName)
            ]).then((result: [CLaboratory, CStock]) => {

                this.delLaboStock(result[0], result[1])
                    .then(() => resolve())
                    .catch((err) => reject(err));

            }).catch((err) => reject(err));

        });
    }
}