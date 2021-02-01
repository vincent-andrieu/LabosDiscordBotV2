import mongoose = require('mongoose');

export type ObjectId = mongoose.Schema.Types.ObjectId;
export const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IModel {
    _id: ObjectId;
}

export class CModel {
    _id: ObjectId;

    constructor(model: IModel) {
        this._id = model._id;
    }
}