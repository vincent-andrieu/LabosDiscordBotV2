import mongoose = require('mongoose');

export type ObjectId = mongoose.Schema.Types.ObjectId;
export const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IModel {
    _id?: ObjectId;
}

export abstract class CModel implements IModel {
    _id?: ObjectId;

    constructor(model: IModel) {
        this._id = model._id;
    }
}