import mongoose = require('mongoose');

import { IUser } from '@global/interfaces/user.interface';
import { CUser } from '@interfaces/user.class';
import DiscordBot from '../init/bot';

const userSchema = new mongoose.Schema({
    discordUser: { type: String, required: true },
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

    public async getById(id: string): Promise<CUser> {
        const result: IUser | undefined = await this._model.findById(id) as unknown as IUser | undefined;

        if (!result) {
            throw "Le user (" + id.toString() + ") n'existe pas";
        }
        return new CUser(result);
    }
}