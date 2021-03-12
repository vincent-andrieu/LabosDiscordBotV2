import * as mongoose from 'mongoose';

import { ILaboratory } from "@global/interfaces/laboratory.interface";
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from "@interfaces/laboratory.class";
import { CStock } from '@interfaces/stock.class';
import { GlobalConfig } from '@global/config';
import { getDrugError, isADrug } from '@global/utils';
import { ServerSchema } from './servers.schema';
import { StockSchema } from './stocks.schema';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';

const laboSchema = new mongoose.Schema({
    server: { type: String, ref: 'servers', required: true },
    name: { type: String, required: true },
    drug: { type: String, required: true },
    stocks: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'stocks' }
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
    next();
}

export class LaboratorySchema {
    private _model = mongoose.model('laboratories', laboSchema);

    public add(labo: CLaboratory): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

            if (!isADrug(labo.drug)) {
                return reject(getDrugError({ drug: true }, labo.drug));
            }
            if (!labo.server) {
                return reject("No link to server");
            }

            this._model.findOne({
                server: labo.server._id,
                name: { $regex: new RegExp(labo.name, 'i') }
            }).populate('stocks').then((currentLabo: unknown) => {
                if (currentLabo) {
                    return reject("Un laboratoire existe déjà sous le nom " + (currentLabo as ILaboratory).name);
                }

                if (labo._id) {
                    delete labo._id;
                }

                this._model.create(labo)
                    .then((newLabo: unknown) => {
                        labo._id = (newLabo as ILaboratory)._id;
                        Sockets.server?.emit('labo.add', labo);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(labo.server, EEmbedMsgColors.ADD, "Laboratoire ajouté")
                            .setDescription("Nom : **" + labo.name + "**\nDrogue : **" + labo.drug + "**");
                        if (labo.screen) {
                            embedMessage.setImage(labo.screen);
                        }
                        labo.server.defaultChannel?.send(embedMessage);

                        resolve(new CLaboratory(newLabo as ILaboratory));
                    })
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public edit(labo: CLaboratory): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {
            this._model.findByIdAndUpdate(labo._id, labo)
                .then(() => {
                    this.getById(labo).then((editedLabo: CLaboratory) => {
                        Sockets.server?.emit('labo.edit', labo);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(labo.server, EEmbedMsgColors.EDIT, "Laboratoire modifié")
                            .setDescription("Nom : **" + labo.name + "**\nDrogue : **" + labo.drug + "**");
                        if (labo.screen) {
                            embedMessage.setImage(labo.screen);
                        }
                        labo.server.defaultChannel?.send(embedMessage);
                        resolve(editedLabo);
                    });
                })
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
            }).populate('stocks')
                .then((result: unknown) => {
                    if (!result) {
                        return reject("Aucun laboratoire existe sous le nom " + name);
                    }
                    resolve(new CLaboratory(result as ILaboratory));
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
            }).populate('stocks')
                .then((res: Array<unknown>) => {
                    if (res.length == 0) {
                        return reject("Aucun laboratoire existe sous le nom " + name);
                    }
                    resolve((res as Array<ILaboratory>).map((labo) => new CLaboratory(labo)));
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
            this._model.findById(labo._id).populate('stocks')
                .then((result: unknown) => {
                    if (!result) {
                        return reject("Le laboratoire " + labo.name + " n'existe pas");
                    }
                    resolve(new CLaboratory(result as ILaboratory));
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
            this._model.find({ server: server._id }).populate('stocks')
                .then((result: Array<unknown>) => resolve((result as Array<ILaboratory>).map((labo) => new CLaboratory(labo))))
                .catch((err) => reject(err));
        });
    }

    public getByServerId(serverId: string): Promise<Array<CLaboratory>> {
        return new Promise<Array<CLaboratory>>((resolve, reject) => {
            new ServerSchema().getById(serverId).then((server) => {
                this.getByServer(server).then((result) =>
                    resolve(result)
                ).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public delete(labo: CLaboratory, reason?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this._model.deleteOne({ server: labo.server._id, _id: labo._id })
                .then((res) => {
                    if (!res.deletedCount || res.deletedCount <= 0) {
                        return reject("Le laboratoire " + labo.name + " n'existe pas");
                    }

                    if (labo.server.defaultLabo?._id?.toString() === labo._id?.toString()) {
                        new ServerSchema().deleteDefaultLabo(labo.server);
                    }

                    labo.server = new CServer(labo.server);
                    const embedMessage = DiscordBot.getDefaultEmbedMsg(labo.server, EEmbedMsgColors.DEL, "Laboratoire **" + labo.name + "** supprimé");
                    if (labo.screen) {
                        embedMessage.setImage(labo.screen);
                    }
                    if (reason) {
                        embedMessage.setDescription(reason);
                    }
                    labo.server.defaultChannel?.send(embedMessage);

                    Sockets.server?.emit('labo.del', labo);
                    resolve(res.deletedCount);
                })
                .catch((err) => reject(err));
        });
    }

    public deleteByName(server: CServer, name: string, reason?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.findOneByName(server, name).then((labo) => {
                this.delete(labo, reason)
                    .then((nbrDeleted) => resolve(nbrDeleted))
                    .catch((err) => reject(err));

            }).catch((err) => reject(err));
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
                    .then((newDefaultLabo: CLaboratory) => resolve(newDefaultLabo))
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
    public addLaboStock(labo: CLaboratory, stock: CStock): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

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
                        .then(() => {
                            const embedMessage = DiscordBot.getDefaultEmbedMsg(crtLabo.server, EEmbedMsgColors.ADD, "Entrepôt ajouté au laboratoire **" + crtLabo.name + "**")
                                .setDescription("**" + crtStock.name + "** : " + crtStock.quantity.toString() + " kg de " + crtStock.drug);
                            if (crtLabo.screen) {
                                embedMessage.setThumbnail(crtLabo.screen);
                            }
                            crtLabo.server.defaultChannel?.send(embedMessage);

                            this._model.findById(crtLabo._id).populate('stocks').then((editedLabo: unknown) => {
                                Sockets.server?.emit('labo.addStock', editedLabo);
                                resolve(new CLaboratory(editedLabo as ILaboratory));
                            }).catch((err) => reject(err));
                        })
                        .catch((err) => reject(err));

                }).catch((err) => reject(err));
            }).catch((err) => reject(err));

        });
    }

    public addLaboStockByNames(server: CServer, laboName: string, stockName: string): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

            Promise.all([
                this.findOneByName(server, laboName, true),
                new StockSchema().findOneByName(server, stockName, true)
            ]).then((result: [CLaboratory, CStock]) => {

                this.addLaboStock(result[0], result[1])
                    .then((editedLabo: CLaboratory) => resolve(editedLabo))
                    .catch((err) => reject(err));

            }).catch((err) => reject(err));

        });
    }

    /**
     * Remove a stock from a laboratory. Do NOT check if labo & stock exist.
     * @param  {CLaboratory} labo
     * @param  {CStock} stock
     * @returns Promise
     */
    public delLaboStock(labo: CLaboratory, stock: CStock): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

            this._model.findByIdAndUpdate(labo._id, { $pull: { stocks: stock._id } })
                .then(() => {
                    const embedMessage = DiscordBot.getDefaultEmbedMsg(labo.server, EEmbedMsgColors.DEL, "Entrepôt supprimé du laboratoire **" + labo.name + "**")
                        .setDescription("**" + stock.name + "** : " + stock.quantity.toString() + " kg de " + stock.drug);
                    if (labo.screen) {
                        embedMessage.setThumbnail(labo.screen);
                    }
                    labo.server.defaultChannel?.send(embedMessage);

                    this.getById(labo).then((deletedLabo: CLaboratory) => {
                        Sockets.server?.emit('labo.delStock', deletedLabo);
                        resolve(deletedLabo);
                    }).catch((err) => reject((err)));
                })
                .catch((err) => reject(err));

        });
    }

    public delLaboStockByNames(server: CServer, laboName: string, stockName: string): Promise<CLaboratory> {
        return new Promise<CLaboratory>((resolve, reject) => {

            Promise.all([
                this.findOneByName(server, laboName),
                new StockSchema().findOneByName(server, stockName)
            ]).then((result: [CLaboratory, CStock]) => {

                this.delLaboStock(result[0], result[1])
                    .then((editedLabo: CLaboratory) => resolve(editedLabo))
                    .catch((err) => reject(err));

            }).catch((err) => reject(err));

        });
    }
}