import mongoose = require('mongoose');

import { GlobalConfig } from '@global/config';
import { getDrugError, isADrugOrStuff } from '@global/utils';
import { IStock } from '@global/interfaces/stock.interface';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from "@interfaces/stock.class";
import DiscordBot, { EEmbedMsgColors } from '../init/bot';
import Sockets from '../init/sockets';
import { ServerSchema } from './servers.schema';
import { LaboratorySchema } from './laboratories.schema';

const stockSchema = new mongoose.Schema({
    server: { type: String, ref: 'servers' },
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
    private _model = mongoose.model('stocks', stockSchema);

    constructor(private _socketService: Sockets) {}

    public add(stock: CStock, userId?: string): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {

            if (!isADrugOrStuff(stock.drug)) {
                return reject(getDrugError({ drug: true, stuff: true }, stock.drug));
            }
            if (!stock.server) {
                return reject("No link to server");
            }

            this._model.findOne({
                server: stock.server._id,
                name: { $regex: new RegExp(stock.name, 'i') }
            }).then((currentStock: unknown) => {
                if (currentStock) {
                    return reject("Un entrepôt existe déjà sous le nom " + (currentStock as IStock).name);
                }

                if (stock._id) {
                    delete stock._id;
                }

                this._model.create(stock)
                    .then((newStock: unknown) => {
                        stock._id = (newStock as IStock)._id;
                        this._socketService.emit('stock.add', stock.server._id, stock);
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(stock.server, EEmbedMsgColors.ADD, "Entrepôt ajouté", userId)
                            .setDescription("Nom : **" + stock.name + "**\nDrogue : **" + stock.drug + "**");
                        if (stock.screen) {
                            embedMessage.setImage(stock.screen);
                        }
                        stock.server.defaultChannel?.send(embedMessage);

                        resolve(new CStock(newStock as IStock));
                    })
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public edit(stock: CStock, userId?: string): Promise<CStock | void> {
        return new Promise<CStock | void>((resolve, reject) => {
            this._model.findByIdAndUpdate(stock._id, stock)
                .then(() => {
                    this.getById(stock).then((editedStock: CStock) => {
                        this._socketService.emit('stock.edit', editedStock.server._id, { stock: editedStock });
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(editedStock.server, EEmbedMsgColors.EDIT, "Entrepôt modifié", userId)
                            .setDescription("Nom : **" + editedStock.name + "**\nDrogue : **" + editedStock.drug + "**");
                        if (editedStock.screen) {
                            embedMessage.setImage(editedStock.screen);
                        }
                        editedStock.server.defaultChannel?.send(embedMessage);
                        resolve(editedStock);
                    });
                })
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
                .then((result: unknown) => {
                    if (!result) {
                        return reject("Aucun entrepôt existe sous le nom " + name);
                    }
                    resolve(new CStock(result as IStock));
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
                .then((res: Array<unknown>) => {
                    if (res.length == 0) {
                        return reject("Aucun entrepôt existe sous le nom " + name);
                    }
                    resolve((res as Array<IStock>).map((stock) => new CStock(stock)));
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
                .then((result: unknown) => {
                    if (!result) {
                        return reject("L'entrepôt " + stock.name + " n'existe pas");
                    }
                    resolve(new CStock(result as IStock));
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
                .then((result: Array<unknown>) => resolve((result as Array<IStock>).map((labo) => new CStock(labo))))
                .catch((err) => reject(err));
        });
    }

    public getByServerId(serverId: string): Promise<Array<CStock>> {
        return new Promise<Array<CStock>>((resolve, reject) => {
            new ServerSchema(this._socketService).getById(serverId).then((server) => {
                this.getByServer(server).then((result) =>
                    resolve(result)
                ).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public delete(stock: CStock, reason?: string, userId?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {

            Promise.all([
                this._model.deleteOne({ server: stock.server._id, _id: stock._id }),
                new LaboratorySchema(this._socketService).delStocks(stock)
            ]).then((res) => {
                if (!res[0].deletedCount || res[0].deletedCount <= 0) {
                    return reject("L'entrepôt " + stock.name + " n'existe pas");
                }

                const embedMessage = DiscordBot.getDefaultEmbedMsg(stock.server, EEmbedMsgColors.DEL, "Entrepôt supprimé", userId);
                if (reason) {
                    embedMessage.setDescription(reason);
                }
                embedMessage.addField("**" + stock.name + "**", stock.quantity.toString() + " kg de " + stock.drug);
                if (stock.screen) {
                    embedMessage.setImage(stock.screen);
                }
                stock.server.defaultChannel?.send(embedMessage);

                this._socketService.emit('stock.del', stock.server._id, stock);

                resolve(res[0].deletedCount);
            })
                .catch((err) => reject(err));
        });
    }

    public deleteByName(server: CServer, name: string, reason?: string, userId?: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.findOneByName(server, name).then((stock) => {
                this.delete(stock, reason, userId)
                    .then((nbrDeleted) => resolve(nbrDeleted))
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public async deleteByServer(server: CServer): Promise<void> {
        await this._model.deleteMany({ server: server._id });
    }

    public addStockQty(stock: CStock, quantity: number, reason?: string, userId?: string, doesPrintMsg = true): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findByIdAndUpdate(stock._id, { $inc: { quantity: quantity } })
                .then(() => {

                    if (doesPrintMsg) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(stock.server, EEmbedMsgColors.ADD, "Ajout du stock de l'entrepôt **" + stock.name + "**", userId)
                            .addFields(
                                { name: "Contenait", value: "**" + stock.quantity.toString() + " kg** de " + stock.drug, inline: true },
                                { name: "Ajouté", value: "**" + quantity.toString() + " kg** de " + stock.drug, inline: true },
                                { name: "Contient maintenant", value: "**" + (stock.quantity + quantity).toString() + " kg** de " + stock.drug, inline: true }
                            );
                        if (reason) {
                            embedMessage.setDescription(reason);
                        }
                        if (stock.screen) {
                            embedMessage.setThumbnail(stock.screen);
                        }
                        stock.server.defaultChannel?.send(embedMessage);
                    }

                    this.getById(stock).then((editedStock: CStock) => {
                        this._socketService.emit('stock.edit', editedStock.server._id, { stock: editedStock, doesPrintMsg });
                        resolve(editedStock);
                    }).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    public addStockQtyByName(server: CServer, name: string, quantity: number, reason?: string, userId?: string): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.addStockQty(stock, quantity, reason, userId)
                        .then((editedStock: CStock) => resolve(editedStock))
                )
                .catch((err) => reject(err))
        );
    }

    public removeStockQty(stock: CStock, quantity: number, reason?: string, userId?: string, doesPrintMsg = true): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {

            quantity = Math.abs(quantity);
            this._model.findOneAndUpdate({ _id: stock._id, quantity: { $gte: quantity } }, { $inc: { quantity: -quantity } })
                .then(() => {

                    if (doesPrintMsg) {
                        const embedMessage = DiscordBot.getDefaultEmbedMsg(stock.server, EEmbedMsgColors.DEL, "Suppression du stock de l'entrepôt **" + stock.name + "**", userId)
                            .addFields(
                                { name: "Contenait", value: "**" + stock.quantity.toString() + " kg** de " + stock.drug, inline: true },
                                { name: "Supprimé", value: "**" + quantity.toString() + " kg** de " + stock.drug, inline: true },
                                { name: "Contient maintenant", value: "**" + (stock.quantity - quantity).toString() + " kg** de " + stock.drug, inline: true }
                            );
                        if (reason) {
                            embedMessage.setDescription(reason);
                        }
                        if (stock.screen) {
                            embedMessage.setThumbnail(stock.screen);
                        }
                        stock.server.defaultChannel?.send(embedMessage);
                    }

                    this.getById(stock).then((editedStock: CStock) => {
                        this._socketService.emit('stock.edit', editedStock.server._id, { stock: editedStock, doesPrintMsg });
                        resolve(editedStock);
                    }).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    public removeStockQtyByName(server: CServer, name: string, quantity: number, reason?: string, userId?: string): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.removeStockQty(stock, quantity, reason, userId)
                        .then((editedStock: CStock) => resolve(editedStock))
                        .catch((err) => reject(err))
                )
                .catch((err) => reject(err))
        );
    }

    public setStockQty(stock: CStock, quantity: number, reason?: string, userId?: string): Promise<CStock> {
        return new Promise<CStock>((resolve, reject) => {
            if (stock.quantity === quantity) {
                return reject(`L'entrepôt ${stock.name} contient déjà ${stock.quantity} kg de ${stock.drug}`);
            }

            this._model.findByIdAndUpdate(stock._id, { quantity: quantity })
                .then(() => {

                    const embedMessage = DiscordBot.getDefaultEmbedMsg(stock.server, EEmbedMsgColors.EDIT, "Modification du stock de l'entrepôt **" + stock.name + "**", userId)
                        .addFields(
                            { name: "Contenait", value: "**" + stock.quantity.toString() + " kg** de " + stock.drug, inline: true },
                            { name: "Modifié à", value: "**" + quantity.toString() + " kg** de " + stock.drug, inline: true }
                        );
                    if (reason) {
                        embedMessage.setDescription(reason);
                    }
                    if (stock.screen) {
                        embedMessage.setThumbnail(stock.screen);
                    }
                    stock.server.defaultChannel?.send(embedMessage);

                    this.getById(stock).then((editedStock: CStock) => {
                        this._socketService.emit('stock.edit', editedStock.server._id, { stock: editedStock });
                        resolve(editedStock);
                    }).catch((err) => reject(err));
                })
                .catch((err) => reject(err));

        });
    }

    public setStockQtyByName(server: CServer, name: string, quantity: number, reason?: string, userId?: string): Promise<CStock | void> {
        return new Promise<CStock | void>((resolve, reject) =>
            this.findOneByName(server, name, true)
                .then((stock: CStock) =>
                    this.setStockQty(stock, quantity, reason, userId)
                        .then((editedStock: CStock) => resolve(editedStock))
                )
                .catch((err) => reject(err))
        );
    }

    public removeProdStock(labo: CLaboratory, prodQty: number, userId?: string, doesPrintMsg = true): Promise<Array<CStock>> {
        return new Promise<Array<CStock>>((resolve, reject) => {
            let tablesQty: number;
            const updatesList: Array<Promise<CStock>> = [];

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
                updatesList.push(this.removeStockQty(stock, stockConfig.needAll ? stockConfig.quantity * tablesQty : prodQty, "Production terminée", userId, doesPrintMsg));
            });

            Promise.all(updatesList).then(resolve).catch(reject);
        });
    }
}