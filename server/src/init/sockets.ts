import { Express } from 'express';
import http from 'http';
import socketIo, { Socket } from 'socket.io';

import { OnlineUsersService } from '@services/online-users.service';
import { serverConfig } from "../server.config";

export default class Sockets {
    private _server?: socketIo.Server;
    private _onlineUsersService?: OnlineUsersService;

    constructor(private _app: Express) {}

    //
    // Setup
    //

    public connect(): Promise<void> {
        return new Promise<void>((resolve) => {
            const server = http.createServer(this._app);
            this._server = socketIo(server);

            server.listen(serverConfig.socket.port, undefined, undefined, () => {
                console.info(`Sockets are listening on port ${serverConfig.socket.port} !`);

                this._userConnectionEvent();

                resolve();
            });
        });
    }

    private _userConnectionEvent(): void {
        if (!this._server) {
            throw Error("Undefined socket server");
        }
        this._onlineUsersService = new OnlineUsersService();

        this._server.on('connection', (socket: Socket) => {
            this._onlineUsersService?.userConnection(socket);

            socket.on('disconnect', () => {
                this._onlineUsersService?.removeUser(socket);
            });
        });
    }

    //
    // Public
    //

    public emit<T>(event: string, serverId?: string, data?: T): void {
        return this._onlineUsersService?.emit(event, serverId, data);
    }
}