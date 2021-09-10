import mongoose = require('mongoose');

import { IUser } from '@global/interfaces/user.interface';
import { CUser } from '@interfaces/user.class';
import DiscordBot from '../init/bot';

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    role: { type: String, required: true }
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})
    .pre('findOne', autoPopulate)
    .pre('find', autoPopulate);

function autoPopulate(this: any, next: any) {
    this.populate('server');
    this.discordUser = DiscordBot.getDiscordUserFromId(this.discordUser);
    next();
}

export class UserSchema {
    private _model = mongoose.model('users', userSchema);

    public async edit(user: CUser): Promise<void> {
        await this._model.findByIdAndUpdate(user._id, user);
    }

    /**
     * Return undefined if the user doesn't exist.
     *
     * @param  {string} id
     * @returns Promise
     */
    public getById(id: string): Promise<CUser | undefined> {
        return new Promise<CUser | undefined>((resolve) => {
            this._model.findById(id).then((result) => {

                if (!result) {
                    resolve(undefined);
                    return;
                }
                resolve(new CUser(result as unknown as IUser));
            }).catch(() => resolve(undefined));
        });
    }
}