import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { GlobalConfig } from '@global/config';
import { IServer } from '@global/interfaces/server.interface';
import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { IProductions } from '@global/interfaces/production.interface';
import { LaboratoryService } from '@services/laboratory.service';
import { ProductionService } from '@services/production.service';
import { ServerService } from '@services/server.service';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CProductions } from '@interfaces/production.class';
import { EPageStatus } from '@interfaces/root.interface';
import { CStock } from '@interfaces/stock.class';
import { EditAreaModalComponent } from '@shared/edit-area-modal/edit-area-modal.component';
import { ConfirmModalComponent } from '@shared/confirm-modal/confirm-modal.component';
import { LaboStocksListModalComponent } from './labo-stocks-list-modal/labo-stocks-list-modal.component';

@Component({
    selector: 'app-labos-list',
    templateUrl: './labos-list.component.html',
    styleUrls: ['./labos-list.component.scss']
})
export class LabosListComponent {
    public laboratories: Array<CLaboratory> = [];
    public laboForms: { [laboId: string]: FormControl } = {};
    public productions: Array<CProductions> = [];
    public prodForms: { [prodId: string]: FormControl } = {};
    public defaultLabo: CLaboratory | undefined = undefined;
    public isLoading = true;

    constructor(
        private _dialog: MatDialog,
        private _laboratoryService: LaboratoryService,
        private _productionService: ProductionService,
        private _serverService: ServerService,
        private _socket: Socket
    ) {
        this._updateLaboratories();
        this._updateProductions();
        _serverService.getCurrentServer().then((server: CServer) => {
            if (server.defaultLabo) {
                this.defaultLabo = new CLaboratory(server.defaultLabo as ILaboratory);
            }
        });

        _socket.on('labo.add', (labo: ILaboratory) => {
            if (labo._id && (labo.server._id || labo.server) === this._serverService.getCurrentServerId()) {
                this.laboratories.push(new CLaboratory(labo));
                this.laboForms[labo._id.toString()] = new FormControl();
            }
        });

        _socket.on('prod.add', (prod: IProductions) => {
            if (prod._id && (prod.server._id || prod.server) === this._serverService.getCurrentServerId()) {
                this.productions.push(new CProductions(prod));
                this.prodForms[prod._id.toString()] = new FormControl();
            }
        });

        _socket.on(`labo.del`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                this.laboratories.remove((laboElem) => labo._id === laboElem._id);
            }
        });

        _socket.on(`prod.del`, (prod: IProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                this.productions.remove((prodElem) => prod._id === prodElem._id);
            }
        });

        _socket.on(`labo.edit`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                const foundLabo = this.laboratories.find((laboElem) => laboElem._id === labo._id);

                if (foundLabo) {
                    foundLabo.server = new CServer(labo.server);
                    foundLabo.name = labo.name;
                    foundLabo.drug = labo.drug;
                    foundLabo.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                    foundLabo.quantity = labo.quantity || 0;
                    foundLabo.screen = labo.screen;
                }
            }
        });

        _socket.on(`labo.addStock`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                const foundLabo = this.laboratories.find((laboElem) => laboElem._id === labo._id);

                if (foundLabo) {
                    foundLabo.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                }
            }
        });

        _socket.on(`labo.delStock`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                const foundLabo = this.laboratories.find((laboElem) => laboElem._id === labo._id);

                if (foundLabo) {
                    foundLabo.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                }
            }
        });

        _socket.on(`labo.default`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                this.defaultLabo = new CLaboratory(labo);
                this.laboratories.forEach((laboElem) => laboElem.server.defaultLabo = labo);
            }
        });

        _socket.on(`server.reminder`, (server: IServer) => {
            if (server._id === this._serverService.getCurrentServerId()) {
                this.laboratories.forEach((labo) => labo.server = new CServer(server));
                this.productions.forEach((prod) => prod.server = new CServer(server));
            }
        });

        _socket.on(`prod.edit`, (prod: CProductions) => {
            if (prod.server._id === this._serverService.getCurrentServerId()) {
                const foundProd = this.productions.find((prodElem) => prodElem._id === prod._id);

                if (foundProd) {
                    foundProd.server = new CServer(prod.server);
                    foundProd.labo = prod.labo;
                    foundProd.description = prod.description;
                    foundProd.quantity = prod.quantity || 0;
                    foundProd.finishDate = prod.finishDate;
                }
            }
        });
    }

    private _updateLaboratories(): void {
        this._laboratoryService.get().then((result) => {
            this.laboratories = result;

            this.laboForms = {};
            this.laboratories.forEach((labo: CLaboratory) => {
                if (labo._id) {
                    this.laboForms[labo._id.toString()] = new FormControl();
                }
            });
            this.isLoading = false;
        });
    }

    private _updateProductions(): void {
        this._productionService.get().then((prods: Array<CProductions>) => {
            this.productions = prods;

            this.prodForms = {};
            this.productions.forEach((prod: CProductions) => {
                if (prod._id) {
                    this.prodForms[prod._id.toString()] = new FormControl();
                }
            });
        });
    }

    public editLabo(labo: CLaboratory): void {
        this._dialog.open(EditAreaModalComponent, {
            minWidth: '40%',
            data: { area: labo, pageStatus: EPageStatus.LABOS, areaList: this.laboratories }
        });
    }

    public openLaboStocksListModal(labo: CLaboratory): void {
        this._dialog.open(LaboStocksListModalComponent, {
            minWidth: '40%',
            data: labo
        });
    }

    public editProd(prod: CProductions): void {
        if (!prod._id || this.prodForms[prod._id.toString()].invalid) {
            return;
        }
        prod.quantity = this.prodForms[prod._id.toString()].value;
        this.prodForms[prod._id.toString()].reset();
        this._productionService.edit(prod);
    }

    public addProd(labo: CLaboratory): void {
        if (!labo._id || this.laboForms[labo._id.toString()].invalid) {
            return;
        }
        const prod: CProductions = new CProductions({
            server: labo.server,
            labo: labo,
            quantity: this.laboForms[labo._id.toString()].value
        });
        this.laboForms[labo._id.toString()].reset();
        this._productionService.add(prod);
    }

    public deleteProd(prod: CProductions): void {
        this._productionService.del(prod).finally(() =>
            this._updateProductions()
        );
    }

    public stockProd(prod: CProductions): void {
        this._productionService.finish(prod).finally(() =>
            this._updateProductions()
        );
    }

    public deleteLabo(labo: CLaboratory): void {
        const dialog = this._dialog.open(ConfirmModalComponent, {
            minWidth: '40%',
            data: {
                title: "Supprimer le laboratoire ?",
                message: `Êtes vous sûr de vouloir supprimer le laboratoire ${labo.name} ?`,
                confirmButton: "Oui",
                cancelButton: "Non"
            }
        });

        dialog.afterClosed().subscribe((result) => {
            if (result) {
                this._laboratoryService.del(labo).finally(() => {
                    this._updateLaboratories();
                    this._updateProductions();
                });
            }
        });
    }

    public getLaboProds(labo: CLaboratory): Array<CProductions> {
        return this.productions.filter((prod) => prod.labo._id === labo._id);
    }

    public isProdFinish(prod: CProductions): boolean {
        return moment(prod.finishDate).isBefore(moment.now());
    }

    public getFinishProdDuration(prod: CProductions): string {
        if (this.isProdFinish(prod)) {
            return "À récupérer !";
        }
        return moment(moment(prod.finishDate).diff(moment.now())).format('m').concat(" min");
    }

    public getSpinnerDuration(prod: CProductions): number {
        return Math.ceil(100 - moment(prod.finishDate).diff(moment.now()) / (GlobalConfig.productions.timeoutMinutes * 10));
    }

}