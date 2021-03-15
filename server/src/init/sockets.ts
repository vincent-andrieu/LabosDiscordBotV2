import { Express } from 'express';
import http from 'http';
import socketIo, { Socket } from 'socket.io';

import { OnlineUsersService } from '@services/online-users.service';
import { serverConfig } from "../server.config";

export default class Sockets {
    public static server: socketIo.Server | undefined = undefined;

    constructor(private app: Express) {}

    public connect(): Promise<socketIo.Server> {
        return new Promise<socketIo.Server>((resolve) => {
            const server = http.createServer(this.app);
            const io = socketIo(server);

            server.listen(serverConfig.socket.port, undefined, undefined, () => {
                console.info(`Sockets are listening on port ${serverConfig.socket.port} !`);

                this._userConnectionEvent(io);

                Sockets.server = io;
                resolve(io);
            });
        });
    }

    private _userConnectionEvent(io: socketIo.Server): void {
        const onlineUsersService = new OnlineUsersService(io);

        io.on('connection', (socket: Socket) => {
            onlineUsersService.userConnection(socket);

            socket.on('disconnect', () => {
                onlineUsersService.removeUser(socket);
            });
        });
    }
}