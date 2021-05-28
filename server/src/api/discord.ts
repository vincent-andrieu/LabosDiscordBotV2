import { Client } from 'discord.js';
import { Express } from 'express';
import { Server } from 'socket.io';

import { DiscordService } from '@services/discord.service';
import { CServer } from '@interfaces/server.class';

export class DiscordHttp {

    private _urlBase = '/discord';
    private _discordService = new DiscordService(this._client);

    constructor(private _app: Express, private _socketServer: Server, private _client: Client) {
        this._init();
    }

    private _init(): void {

        // Get discord url
        this._app.get(`${this._urlBase}/get/url`, (request, response) => {
            const serverId: string = request.query.serverId as string;
            const password: string = request.query.password as string;

            this._discordService.getAuthUrl(serverId, password)
                .then((url: string) => response.send(url))
                .catch((err) => response.send(err));
        });

        // Set discord token
        this._app.get(`${this._urlBase}/set`, (request, response) => {
            const serverId: string = request.query.serverId as string;
            const code: string = request.query.code as string;

            this._discordService.setToken(code, serverId)
                .then((userId) => response.send(userId))
                .catch((err) => response.status(500).send(err));
        });

        // Get channel users
        this._app.get(`${this._urlBase}/get/channel/users`, (request, response) => {
            const server: CServer = new CServer(JSON.parse(request.query.server as string));

            response.send(this._discordService.getChannelUsers(server));
        });
    }
}