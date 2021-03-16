import mongoose = require('mongoose');
import moment from 'moment';

import { GlobalConfig } from '@global/config';
import { IProdFinish, IProductions } from '@global/interfaces/production.interface';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CProductions } from "@interfaces/production.class";
import { CStock } from '@interfaces/stock.class';
import { LaboratorySchema } from './laboratories.schema';
import { StockSchema } from './stocks.schema';
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';
import { ServerSchema } from './servers.schema';

const prodSchema = new mongoose.Schema({
    server: { type: String, ref: 'servers' },
    labo: { type: mongoose.Schema.Types.ObjectId, ref: 'laboratories' },
    quantity: { type: Number, required: false },
    finishDate: { type: Date, required: false, default: () => moment(moment.now()).add(GlobalConfig.productions.timeoutMinutes, 'minutes').toDate() },
    description: { type: String, required: false}
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

export class ProductionSchema {
    private _model = mongoose.model('productions', prodSchema);
    private static finishProdReactions: Array<{ msgId: string, prod: CProductions }> = [];

    public add(prod: CProductions, userId?: string): Promise<Promise<void>> {
        return new Promise<Promise<void>>((resolve, reject) => {

            new LaboratorySchema().getById(prod.labo).then((labo: CLaboratory) => {
                prod.labo = labo;
                if (labo.stocks.length == 0) {
                    return reject("Aucun entrepôt n'a été relié au laboratoire " + prod.labo.name);
                }

                let doesCancel = false;
                let tablesQty = -1;
                let str = "";
                for (const stuff of GlobalConfig.productions.drugs[prod.labo.drug].recipe) {
                    const stock = prod.labo.stocks.find((iStock) => iStock.drug === stuff.name);
                    if (stock) {
                        if (!stuff.needAll) {
                            tablesQty = Math.ceil(prod.quantity / stuff.quantity);
                        }
                        if (stuff.needAll && tablesQty < 0) {
                            tablesQty = GlobalConfig.productions.drugs[prod.labo.drug].table;
                        }
                        if (stock.quantity < (stuff.needAll ? stuff.quantity * tablesQty : prod.quantity)) {
                            str += "\nIl n'y a pas assez de " + stuff.name + " dans l'entrepôt " + stock.name;
                            doesCancel = true;
                        }
                    } else {
                        str += "Aucun entrepôt de " + stuff.name + " a été assigné au laboratoire " + prod.labo.name;
                        doesCancel = true;
                    }
                }
                if (doesCancel) {
                    return reject(str);
                }
                if (!labo.stocks.find((iStock) => iStock.drug === labo.drug)) {
                    return reject("Aucun entrepôt de " + labo.drug + " a été assigné au laboratoire " + labo.name);
                }

                new StockSchema().removeProdStock(labo, prod.quantity, userId, false).then(() => {
                    const tempLabo = prod.labo;
                    prod.labo = labo._id as unknown as CLaboratory;
                    delete prod._id;
                    this._model.create(prod)
                        .then((prodAdded) => {
                            prod._id = prodAdded._id;
                            prod.labo = tempLabo;
                            if (Sockets.server) {
                                Sockets.server.emit('prod.add', prod);
                            }
                            resolve(this.addProdProcess(prod, userId));
                        })
                        .catch((err) => reject(err));
                });
            }).catch((err) => reject(err));

        });
    }

    private addProdProcess(prod: CProductions, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const newProdEmbedMsg = DiscordBot.getDefaultEmbedMsg(prod.server, EEmbedMsgColors.ADD, "Nouvelle production dans le laboratoire **" + prod.labo.name + "**", userId)
                .setDescription((prod.description ? prod.description + "\n" : "") + "**" + prod.quantity + " kg** de **" + prod.labo.drug + "**");
            if (prod.labo.screen) {
                newProdEmbedMsg.setThumbnail(prod.labo.screen);
            }
            prod.server.defaultChannel?.send(newProdEmbedMsg).then((prodMsg) => {

                setTimeout(() => {
                    this.getById(prod).then((readyProd: CProductions) => {
                        if (Sockets.server) {
                            Sockets.server.emit('prod.finish', readyProd);
                        }
                        const finishProdEmbedMsg = DiscordBot.getDefaultEmbedMsg(prod.server, EEmbedMsgColors.ADD, "Production du laboratoire **" + prod.labo.name + "** prête", userId)
                            .setDescription("**" + readyProd.quantity + " kg** de **" + readyProd.labo.drug + "**");
                        if (prod.labo.screen) {
                            finishProdEmbedMsg.setThumbnail(prod.labo.screen);
                        }
                        prod.server.defaultChannel?.send(finishProdEmbedMsg);
                        if (prod.server.roleTag) {
                            prod.server.defaultChannel?.send(prod.server.roleTag);
                        }
                        prodMsg.react(GlobalConfig.productions.getProdEmoji).then((messageReaction) =>
                            ProductionSchema.finishProdReactions.push({ msgId: messageReaction.message.id, prod: readyProd })
                        )
                            .catch((err) => reject(err))
                            .finally(() => resolve());
                    });
                }, GlobalConfig.productions.timeoutMinutes * 60 * 1000);

                if (prod.server.reminder && prod.server.reminder > 0) {
                    setTimeout(() => {
                        this.getById(prod).then((readyProd: CProductions) => {
                            if (Sockets.server) {
                                Sockets.server.emit('prod.reminder', readyProd);
                            }
                            const finishAlertEmbedMsg = DiscordBot.getDefaultEmbedMsg(prod.server, EEmbedMsgColors.INFO, "Production du laboratoire **" + prod.labo.name + "** prête dans " + prod.server.reminder?.toString() + " minutes", userId)
                                .setDescription("**" + readyProd.quantity + " kg** de **" + readyProd.labo.drug + "**");
                            if (readyProd.labo.screen) {
                                finishAlertEmbedMsg.setThumbnail(readyProd.labo.screen);
                            }
                            prod.server.defaultChannel?.send(finishAlertEmbedMsg);
                            if (prod.server.roleTag) {
                                prod.server.defaultChannel?.send(prod.server.roleTag);
                            }
                        });
                    }, (GlobalConfig.productions.timeoutMinutes - prod.server.reminder) * 60 * 1000);
                }

            }).catch((err) => reject(err));
        });
    }

    public edit(prod: CProductions): Promise<CProductions> {
        return new Promise<CProductions>((resolve, reject) => {
            this._model.findByIdAndUpdate(prod._id, prod)
                .then(() => {
                    this.getById(prod).then((editedProd: CProductions) => {
                        Sockets.server?.emit('prod.edit', editedProd);
                        resolve(editedProd);
                    });
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Return an array of productions by a labo name.
     * Return an error if the labo name doesn't exist.
     * @param  {CServer} server
     * @param  {string} laboName
     * @param  {boolean} ignoreCase?
     * @returns Promise
     */
    public findByName(server: CServer, laboName: string, ignoreCase?: boolean): Promise<Array<CProductions>> {
        return new Promise<Array<CProductions>>((resolve, reject) => {

            new LaboratorySchema().findByName(server, laboName, ignoreCase)
                .then((labos) =>
                    this._model.find({ labo: { $in: labos.map((labo) => labo._id) } }).populate({
                        path: 'labo',
                        populate: 'server stocks'
                    })
                        .then((prods: unknown) =>
                            resolve((prods as Array<IProductions>).map((prod) => new CProductions(prod))))
                        .catch((err) => reject(err))
                ).catch((err) => reject(err));

        });
    }

    /**
     * Return production by its id.
     * Return an error if production doesn't exist.
     * @param  {ObjectId} id
     * @returns Promise
     */
    public getById(prod: CProductions): Promise<CProductions> {
        return new Promise<CProductions>((resolve, reject) => {
            this._model.findById(prod._id).populate({
                path: 'labo',
                populate: 'server stocks'
            })
                .then((result: unknown) => {
                    if (!result) {
                        return reject("La production du laboratoire " + prod.labo.name + " n'existe pas");
                    }
                    resolve(new CProductions(result as IProductions));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Return an array of productions by laboratory id.
     * Return an error if laboratory id doesn't exist.
     * @param  {ObjectId} id
     * @returns Promise
     */
    public getByLaboId(labo: CLaboratory): Promise<Array<CProductions>> {
        return new Promise<Array<CProductions>>((resolve, reject) => {
            this._model.find({ server: labo.server._id, labo: labo._id }).populate({
                path: 'labo',
                populate: 'server stocks'
            })
                .then((result: Array<unknown>) => {
                    const labos = result as Array<IProductions>;
                    if (labos.length == 0) {
                        return reject("Aucune production n'est en cours dans le laboratoire " + labo.name);
                    }
                    resolve(labos.map((prod) => new CProductions(prod)));
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Return an array of server's productions.
     * Do NOT return an error if it doesn't have any productions.
     * @param  {CServer} server
     * @returns Promise
     */
    public getByServer(server: CServer): Promise<Array<CProductions>> {
        return new Promise<Array<CProductions>>((resolve, reject) => {
            this._model.find({ server: server._id }).populate({
                path: 'labo',
                populate: 'server stocks'
            })
                .then((result: Array<unknown>) =>
                    resolve((result as Array<IProductions>).map((prod) => new CProductions(prod)))
                )
                .catch((err) => reject(err));
        });
    }

    public getByServerId(serverId: string): Promise<Array<CProductions>> {
        return new Promise<Array<CProductions>>((resolve, reject) => {
            new ServerSchema().getById(serverId).then((server) => {
                this.getByServer(server).then((result) =>
                    resolve(result)
                ).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public deleteById(prod: CProductions, reason?: string, userId?: string, doesPrintMsg = true): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            this._model.deleteOne({ server: prod.server._id, _id: prod._id })
                .then((res) => {
                    if (!res.deletedCount ||  res.deletedCount <= 0) {
                        return reject("La production du laboratoire " + prod.labo.name + " n'existe pas");
                    }
                    Sockets.server?.emit('prod.del', prod, doesPrintMsg);

                    if (doesPrintMsg) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(prod.server, EEmbedMsgColors.DEL, "Production du laboratoire **" + prod.labo.name + "** supprimée", userId);
                        if (prod.labo.screen) {
                            embedMessage.setThumbnail(prod.labo.screen);
                        }
                        if (reason) {
                            embedMessage.setDescription(reason);
                        }
                        prod.server.defaultChannel?.send(embedMessage);
                    }

                    resolve();
                })
                .catch((err) => reject(err));

        });
    }

    /**
     * Delete all productions of a laboratory
     * @param  {CProductions|CLaboratory} laboProd
     * @param  {string} reason?
     * @returns Promise
     */
    public deleteByLabo(laboProd: CProductions | CLaboratory, reason?: string, userId?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            this._model.deleteMany({ server: laboProd.server._id, labo: (laboProd as CProductions).labo?._id || laboProd._id })
                .then((res) => {
                    const laboProdName = ((laboProd as CLaboratory).name || (laboProd as CProductions).labo.name);
                    if (!res.deletedCount || res.deletedCount <= 0) {
                        return reject("Aucune production n'est en cours dans le laboratoire " + laboProdName);
                    }
                    if (Sockets.server) {
                        Sockets.server.emit('prod.del', laboProd.server);
                    }

                    const embedMsgTitle = res.deletedCount > 1
                        ? res.deletedCount.toString() + " productions ont été supprimées du laboratoire **" + laboProdName + "**"
                        : "La production du laboratoire " + laboProdName + " a été supprimée";
                    const embedMessage = DiscordBot.getDefaultEmbedMsg(laboProd.server, EEmbedMsgColors.DEL, embedMsgTitle, userId);
                    const laboProdScreen = (laboProd as CLaboratory).screen || (laboProd as CProductions).labo.screen;
                    if (laboProdScreen) {
                        embedMessage.setImage(laboProdScreen);
                    }
                    if (reason) {
                        embedMessage.setDescription(reason);
                    }
                    laboProd.server.defaultChannel?.send(embedMessage);

                    resolve();
                })
                .catch((err) => reject(err));

        });
    }

    public addStockQty(prod: CProductions, quantity: number): Promise<CProductions> {
        return new Promise<CProductions>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findByIdAndUpdate(prod._id, { $inc: { quantity: quantity } })
                .then(() => {
                    this.getById(prod).then((editedProd: CProductions) => {
                        Sockets.server?.emit('prod.edit', editedProd);
                        resolve(editedProd);
                    }
                    ).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    public removeStockQty(prod: CProductions, quantity: number): Promise<CProductions> {
        return new Promise<CProductions>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findOneAndUpdate({ _id: prod._id, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } })
                .then(() => {
                    this.getById(prod).then((editedProd: CProductions) => {
                        Sockets.server?.emit('prod.edit', editedProd);
                        resolve(editedProd);
                    }
                    ).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    public setStockQty(prod: CProductions, quantity: number): Promise<CProductions> {
        return new Promise<CProductions>((resolve, reject) => {

            this._model.findByIdAndUpdate(prod._id, { quantity: quantity })
                .then(() => {
                    this.getById(prod).then((editedProd: CProductions) => {
                        Sockets.server?.emit('prod.edit', editedProd);
                        resolve(editedProd);
                    }
                    ).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    private getFinishProd(prodId: string | CProductions): CProductions | undefined {
        if (typeof prodId === 'string') {
            const prodIndex = ProductionSchema.finishProdReactions.findIndex((prodElem) => prodElem.msgId === prodId);

            if (prodIndex < 0) {
                return undefined;
            }
            const prodResult = ProductionSchema.finishProdReactions[prodIndex].prod;
            ProductionSchema.finishProdReactions.splice(prodIndex, 1);
            return prodResult;
        } else {
            const prodIndex = ProductionSchema.finishProdReactions.findIndex((prodElem) => prodElem.prod._id === prodId._id);

            if (prodIndex >= 0) {
                ProductionSchema.finishProdReactions.splice(prodIndex, 1);
            }
            return prodId;
        }
    }

    public finishProd(prodId: string | CProductions, userId?: string): Promise<IProdFinish> {
        return new Promise<IProdFinish>((resolve, reject) => {
            const prod: CProductions | undefined = this.getFinishProd(prodId);
            if (!prod) {
                return reject("Production introuvée");
            }
            const query = [
                {
                    $match: {
                        _id: typeof prod._id === 'string' ? mongoose.Types.ObjectId(prod._id) : prod._id
                    }
                },
                {
                    $lookup: {
                        from: 'servers',
                        let: { serverId: '$server' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [{$toString: '$_id'}, "$$serverId"]
                                    }
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: 'server'
                    }
                },
                {
                    $lookup: {
                        from: 'laboratories',
                        let: { laboId: '$labo' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', "$$laboId"]
                                    }
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: 'laboData'
                    }
                },
                {
                    $lookup: {
                        from: 'stocks',
                        let: {
                            laboData: { $first: '$laboData' },
                            prodQty: '$quantity'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ['$_id', '$$laboData.stocks'] },
                                            { $eq: ['$drug', '$$laboData.drug'] }
                                        ]
                                    }
                                }
                            },
                            { $limit: 1 }
                        ],
                        as: 'stock'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        server: {$first: '$server'},
                        labo: {$first: '$laboData'},
                        quantity: 1,
                        finishDate: 1,
                        description: 1,
                        stock: {$first: '$stock'}
                    }
                }
            ];

            this._model.aggregate(query)
                .then((result: Array<IProdFinish>) => {
                    if (result && result[0]._id && result[0].server && result[0].quantity && result[0].labo && result[0].stock) {
                        const prodFinish = result[0];

                        prodFinish.server = new CServer(prodFinish.server);
                        new StockSchema().addStockQty(new CStock(prodFinish.stock), prodFinish.quantity || 0, "Production terminée", userId, false).then((addedStock) =>

                            this.deleteById(prodFinish as unknown as CProductions, "Production terminée", userId, false)
                                .then(() => {
                                    const embedMessage = DiscordBot.getDefaultEmbedMsg(prod.server, EEmbedMsgColors.ADD, "Production du laboratoire **" + prodFinish.labo.name + "** stockée", userId)
                                        .setDescription("**" + addedStock.name + "** : **" + (addedStock.quantity || 0).toString() + " kg** de " + addedStock.drug + ".");
                                    if (addedStock.screen) {
                                        embedMessage.setThumbnail(addedStock.screen);
                                    }
                                    (prodFinish.server as CServer).defaultChannel?.send(embedMessage);
                                    resolve(prodFinish);
                                })
                                .catch((error) => reject(error))

                        ).catch((error) => reject(error));

                    } else {
                        reject("Le stock n'a pas pu être modifié " + (result ? "(" + JSON.stringify(result) + ")" : "") + ".");
                    }
                })
                .catch((error) => reject(error));
        });
    }
}