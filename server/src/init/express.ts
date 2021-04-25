import { Express } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import { Server } from 'socket.io';

import { serverConfig } from '../server.config';
import Sockets from '../init/sockets';
import { DiscordHttp } from '@api/discord';
import { ServerHttp } from '@api/server';
import { LaboratoryHttp } from '@api/laboratory';
import { StockHttp } from '@api/stock';
import { ProductionHttp } from '@api/production';
import { LocationHttp } from '@api/location';

export default class ExpressServer {

    constructor(private _app: Express) {
        this._app.use(json({limit: '5mb'}));
        this._app.use(urlencoded({extended: true}));

        this._app.use(cors());
        this._app.use(function(request, result, next) {
            result.setHeader('Access-Control-Allow-Origin', '*');
            next();
        });

        this._app.listen(serverConfig.express.port, () => {
            console.info(`App listening on port ${serverConfig.express.port} !`);

            new Sockets(this._app).connect().then((socketServer: Server) => this._init(socketServer));
        });
    }

    private _init(socketServer: Server): void {
        new DiscordHttp(this._app, socketServer);
        new LaboratoryHttp(this._app, socketServer);
        new StockHttp(this._app, socketServer);
        new ProductionHttp(this._app, socketServer);
        new ServerHttp(this._app, socketServer);
        new LocationHttp(this._app, socketServer);
    }

}