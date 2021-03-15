import { Express } from 'express';
import { Server } from 'socket.io';

import { atob } from '@global/utils';
import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';
import { LaboratorySchema } from '@schemas/laboratories.schema';
import { ServerSchema } from '@schemas/servers.schema';

export class LaboratoryHttp {

    private _urlBase = '/labo';
    private _laboratorySchema: LaboratorySchema;
    private _serverSchema: ServerSchema;

    constructor(private _app: Express, private _socketServer: Server) {
        this._laboratorySchema = new LaboratorySchema();
        this._serverSchema = new ServerSchema();
        this._init();
    }

    private _init(): void {

        // Add labo
        this._app.put(`${this._urlBase}/add`, (request, response) => {
            const userId: string = request.query.userId as string;
            const labo: ILaboratory = request.body;

            this._laboratorySchema.add(new CLaboratory(labo), atob(userId)).then((newLabo: CLaboratory) => {
                response.send(newLabo);
            }).catch((err) => response.send(err));
        });

        // Delete labo
        this._app.delete(`${this._urlBase}/delete`, (request, response) => {
            const userId: string = request.query.userId as string;
            const labo: ILaboratory = JSON.parse(request.query.value as string);

            this._laboratorySchema.delete(new CLaboratory(labo), undefined, atob(userId)).then(() => {
                response.send(labo);
            }).catch((err) => response.send(err));
        });

        // Edit labo
        this._app.post(`${this._urlBase}/edit`, (request, response) => {
            const userId: string = request.query.userId as string;
            const labo: ILaboratory = request.body;

            this._laboratorySchema.edit(new CLaboratory(labo), atob(userId)).then((editedLabo: CLaboratory) => {
                response.send(editedLabo);
            }).catch((err) => response.send(err));
        });

        // Get labos
        this._app.get(`${this._urlBase}/get`, (request, response) => {
            const serverId: string = request.query.serverId as string;

            this._laboratorySchema.getByServerId(serverId).then((labos) => {
                response.send(labos);
            }).catch((err) => response.send(err));
        });

        // Add labo stock
        this._app.put(`${this._urlBase}/addStock`, (request, response) => {
            const userId: string | undefined = request.body.userId;
            const labo: CLaboratory = new CLaboratory(request.body.labo);
            const stock: CStock = new CStock(request.body.stock);

            this._laboratorySchema.addLaboStock(labo, stock, atob(userId)).then((newLabo: CLaboratory) => {
                response.send(newLabo);
            }).catch((err) => response.send(err));
        });

        // Delete labo stock
        this._app.delete(`${this._urlBase}/delStock`, (request, response) => {
            const userId: string = request.query.userId as string;
            const labo: CLaboratory = new CLaboratory(JSON.parse(request.query.labo as string));
            const stock: CStock = new CStock(JSON.parse(request.query.stock as string));

            this._laboratorySchema.delLaboStock(labo, stock, atob(userId)).then((deletedLabo: CLaboratory) => {
                response.send(deletedLabo);
            }).catch((err) => response.send(err));
        });

        // Set default labo
        this._app.post(`${this._urlBase}/setDefault`, (request, response) => {
            const userId: string = request.query.userId as string;
            const labo: CLaboratory = new CLaboratory(request.body.labo);

            new ServerSchema().forceSetDefaultLabo(labo, atob(userId)).then(() => {
                response.send(labo);
            }).catch((err) => response.send(err));
        });
    }
}