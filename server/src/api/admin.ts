import { Express } from 'express';
import { Server } from 'socket.io';

import { atob } from '@global/utils';
import { ERole } from '@global/interfaces/user.interface';
import { ServerSchema } from '@schemas/servers.schema';
import { LaboratorySchema } from '@schemas/laboratories.schema';
import { ProductionSchema } from '@schemas/productions.schema';
import { StockSchema } from '@schemas/stocks.schema';
import { LocationSchema } from '@schemas/locations.schema';
import { CUser } from '@interfaces/user.class';
import { UserSchema } from '../schemas/users.schema';
import { CServer } from '@interfaces/server.class';
import DiscordBot from 'init/bot';

export class AdminHttp {

    private _urlBase = '/admin';
    private _usersSchema: UserSchema;
    private _serverSchema: ServerSchema;
    private _laboratorySchema: LaboratorySchema;
    private _productionSchema: ProductionSchema;
    private _stockSchema: StockSchema;
    private _locationSchema: LocationSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._usersSchema = new UserSchema();
        this._serverSchema = new ServerSchema();
        this._laboratorySchema = new LaboratorySchema();
        this._productionSchema = new ProductionSchema();
        this._stockSchema = new StockSchema();
        this._locationSchema = new LocationSchema();
        this._init();
    }

    private _init(): void {

        // Get user by id
        this._app.get(`${this._urlBase}/user`, async (request, response) => {
            const userId: string = request.query.userId as string;

            response.send(await this._isAdmin(userId));
        });

        // Get servers
        this._app.get(`${this._urlBase}/servers`, async (request, response) => {
            const userId: string = request.query.userId as string;

            if (!await this._isAdmin(userId)) {
                return response.status(403).send();
            }
            response.send(this._serverSchema.getAll());
        });

        // Delete server
        this._app.delete(`${this._urlBase}/server`, async (request, response) => {
            const server: CServer = new CServer(JSON.parse(request.query.server as string));
            const userId: string = request.query.userId as string;

            if (!await this._isAdmin(userId)) {
                return response.status(403).send();
            }
            Promise.all([
                this._serverSchema.delete(server),
                this._laboratorySchema.deleteByServer(server),
                this._productionSchema.deleteByServer(server),
                this._stockSchema.deleteByServer(server),
                this._locationSchema.deleteByServer(server),
                DiscordBot.leaveGuild(server)

            ])
                .then(() => {
                    response.send();
                    this._socketServer.emit('admin.server.del', server);
                })
                .catch((err) => response.status(500).send(err));
        });
    }

    /**
     * @description
     * Pass the encrypted userId.
     * Return the user if its admin. Otherwise return undefined.
     *
     * @param  {string} userId
     * @returns Promise
     */
    private async _isAdmin(userId: string): Promise<CUser | undefined> {
        const user: CUser = await this._usersSchema.getById(atob(userId) || '');

        if (!user || user.role !== ERole.ADMIN) {
            return undefined;
        }
        return user;
    }
}