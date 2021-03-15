import { Express } from 'express';
import { Server } from 'socket.io';

import { DiscordService } from '@services/discord.service';

export class DiscordHttp {

    private _urlBase = '/discord';
    private _discordService = new DiscordService;

    constructor(private _app: Express, private _socketServer: Server) {
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
    }
}