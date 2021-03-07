import { Express } from 'express';
import http from 'http';
import socketIo from 'socket.io';

import { serverConfig } from "../server.config";

export default class Sockets {
    public static server: socketIo.Server;

    constructor(private app: Express) {}

    public connect(): Promise<socketIo.Server> {
        return new Promise<socketIo.Server>((resolve) => {
            const server = http.createServer(this.app);
            const io = socketIo(server);

            server.listen(serverConfig.socket.port, undefined, undefined, () => {
                console.info(`Sockets are listening on port ${serverConfig.socket.port} !`);

                Sockets.server = io;
                resolve(io);
            });
        });
    }
}