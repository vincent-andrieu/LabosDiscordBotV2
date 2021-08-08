import { Client } from 'discord.js';
import { Express } from 'express';
import { Server } from 'socket.io';

import { atob } from '@global/utils';
import { ServerSchema } from '@schemas/servers.schema';
import { CServer } from '@interfaces/server.class';
import { DiscordService } from '@services/discord.service';

export class ServerHttp {

    private _urlBase = '/server';
    private _serverSchema: ServerSchema;

    constructor(private _app: Express, private _socketServer: Server, private _client: Client) {
        this._serverSchema = new ServerSchema();
        this._init();
    }

    private _init(): void {

        // Login
        this._app.get(`${this._urlBase}/login`, (request, response) => {
            const serverId: string = request.query.serverId as string;
            const password: string = request.query.password as string;
            const userId: string = request.query.userId as string;

            Promise.all([
                this._serverSchema.login(serverId, password),
                new DiscordService(this._client).isUserInServer(serverId, atob(userId) || '')
            ])
                .then((result) => {
                    response.send(result[0] && result[1]);
                }).catch((err) => response.status(500).send(err));
        });

        // Set reminder
        this._app.post(`${this._urlBase}/setReminder`, (request, response) => {
            const userId: string = request.body.userId;
            const serverId: string = request.body.serverId;
            const reminder: number = request.body.reminder;

            this._serverSchema.setReminderFromId(serverId, reminder, atob(userId)).then((editedServer: CServer) => {
                response.send(editedServer);
            }).catch((err) => response.send(err));
        });

        // Set role tag
        this._app.post(`${this._urlBase}/setRoleTag`, (request, response) => {
            const userId: string = request.body.userId;
            const serverId: string = request.body.serverId;
            const roleTag: string = request.body.roleTag;

            this._serverSchema.setRoleTagFromId(serverId, roleTag, atob(userId)).then((editedServer: CServer) => {
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

        // Get server name
        this._app.get(`${this._urlBase}/name`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._serverSchema.getById(serverId).then((server: CServer) => {
                response.send(JSON.stringify(server.guild?.name));
            }).catch((err) => response.send(err));
        });

        // Get server avatar
        this._app.get(`${this._urlBase}/avatar`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._serverSchema.getById(serverId).then((server: CServer) => {
                response.send(JSON.stringify(server.guild?.iconURL()));
            }).catch((err) => response.send(err));
        });
    }
}