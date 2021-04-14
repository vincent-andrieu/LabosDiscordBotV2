import mongoose = require('mongoose');

import { serverConfig } from "../server.config";

export default class DataBase {

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let uris = `mongodb://${serverConfig.database.host}:${serverConfig.database.port}/${serverConfig.database.name}`;

            if (serverConfig.database.username && serverConfig.database.password) {
                uris = `mongodb://${serverConfig.database.username}:${serverConfig.database.password}@${serverConfig.database.host}:${serverConfig.database.port}/${serverConfig.database.name}?authSource=admin`;
            }
            mongoose.connect(uris, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.info("DataBase successfully connected : \n\t- Address : " +
                        serverConfig.database.host +
                        "\n\t- Port : " + serverConfig.database.port +
                        "\n\t- Name : " + serverConfig.database.name
                    );
                    resolve();
                }
            });
        });
    }
}