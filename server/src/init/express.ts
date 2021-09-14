import { Client } from 'discord.js';
import { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { Server } from 'socket.io';

import { serverConfig } from '../server.config';
import Sockets from '../init/sockets';
import { DiscordHttp } from '@api/discord';
import { AdminHttp } from '@api/admin';
import { ServerHttp } from '@api/server';
import { LaboratoryHttp } from '@api/laboratory';
import { StockHttp } from '@api/stock';
import { ProductionHttp } from '@api/production';
import { LocationHttp } from '@api/location';

export default class ExpressServer {

    constructor(private _app: Express, private _client: Client) {}

    public connect(): Promise<Sockets> {
        return new Promise<Sockets>((resolve) => {
            this._app.use(json({ limit: '5mb' }));
            this._app.use(urlencoded({ extended: true }));

            this._app.use(cors());
            this._app.use(function (request, result, next) {
                result.setHeader('Access-Control-Allow-Origin', '*');
                next();
            });

            this._app.listen(serverConfig.express.port, () => {
                console.info(`App listening on port ${serverConfig.express.port} !`);

                const socketsService = new Sockets(this._app);
                socketsService.connect().then(() => {
                    this._init(socketsService);
                    resolve(socketsService);
                });
            });
        });
    }

    private _init(socketService: Sockets): void {
        new AdminHttp(this._app, socketService);
        new DiscordHttp(this._app, socketService, this._client);
        new LaboratoryHttp(this._app, socketService);
        new StockHttp(this._app, socketService);
        new ProductionHttp(this._app, socketService);
        new ServerHttp(this._app, socketService, this._client);
        new LocationHttp(this._app, socketService);
    }

}