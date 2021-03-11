import { Express } from 'express';
import { Server } from 'socket.io';

import { ServerSchema } from '@schemas/servers.schema';
import { CServer } from '@interfaces/server.class';

export class ServerHttp {

    private _urlBase = '/server';
    private _serverSchema: ServerSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._serverSchema = new ServerSchema();
        this._init();
    }

    private _init(): void {

        // Login
        this._app.get(`${this._urlBase}/login`, (request, response) => {
            const serverId: string = request.query.serverId as string;
            const password: string = request.query.password as string;

            this._serverSchema.login(serverId, password).then((result: boolean) => {
                response.send(result);
            }).catch((err) => response.send(err));
        });

        // Set reminder
        this._app.post(`${this._urlBase}/setReminder`, (request, response) => {
            const server: CServer = new CServer(request.body.server);
            const reminder: number = request.body.reminder;

            this._serverSchema.setReminder(server, reminder).then((editedServer: CServer) => {
                response.send(editedServer);
            }).catch((err) => response.send(err));
        });

        // Get server
        this._app.get(`${this._urlBase}/get`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._serverSchema.getById(serverId).then((server) => {
                response.send(server);
            }).catch((err) => response.send(err));
        });
    }
}