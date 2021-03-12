import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Socket } from 'ngx-socket-io';
import * as moment from 'moment';

import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { GlobalConfig } from '@global/config';
import { LaboratoryService } from '@services/laboratory.service';
import { ProductionService } from '@services/production.service';
import { ServerService } from '@services/server.service';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CProductions } from '@interfaces/production.class';
import { EPageStatus } from '@interfaces/root.interface';
import { EditAreaModalComponent } from '@shared/edit-area-modal/edit-area-modal.component';
import { ConfirmModalComponent } from '@shared/confirm-modal/confirm-modal.component';
import { LaboStocksListModalComponent } from './labo-stocks-list-modal/labo-stocks-list-modal.component';
import { removeElemFromArray } from '@global/utils';
import { CStock } from '@interfaces/stock.class';

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
                this.defaultLabo = new CLaboratory(server.defaultLabo);
            }
        });

        _socket.on('labo.add', (labo: ILaboratory) => {
            if (labo._id && (labo.server._id || labo.server) === this._serverService.getCurrentServerId()) {
                this.laboratories.push(new CLaboratory(labo));
                this.laboForms[labo._id.toString()] = new FormControl();
            }
        });

        _socket.on(`labo.del`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                removeElemFromArray(this.laboratories, (laboElem) => labo._id === laboElem._id);
            }
        });

        _socket.on(`labo.edit`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                for (const laboElem of this.laboratories) {
                    if (labo._id === laboElem._id) {
                        laboElem.server = new CServer(labo.server);
                        laboElem.name = labo.name;
                        laboElem.drug = labo.drug;
                        laboElem.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                        laboElem.quantity = labo.quantity || 0;
                        laboElem.screen = labo.screen;
                        break;
                    }
                }
            }
        });

        _socket.on(`labo.addStock`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                for (const laboElem of this.laboratories) {
                    if (labo._id === laboElem._id) {
                        laboElem.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                        break;
                    }
                }
            }
        });

        _socket.on(`labo.delStock`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                for (const laboElem of this.laboratories) {
                    if (labo._id === laboElem._id) {
                        laboElem.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                        break;
                    }
                }
            }
        });

        _socket.on(`labo.default`, (labo: ILaboratory) => {
            if (labo.server._id === this._serverService.getCurrentServerId()) {
                this.defaultLabo = new CLaboratory(labo);
            }
        });
    }

    private _updateLaboratories(): void {
        this._laboratoryService.get().then((result) => {
            this.laboratories = result;
            this.isLoading = false;

            this.laboForms = {};
            this.laboratories.forEach((labo: CLaboratory) => {
                if (labo._id) {
                    this.laboForms[labo._id.toString()] = new FormControl();
                }
            });
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
        this._productionService.edit(prod).finally(() =>
            this._updateProductions()
        );
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
        this._productionService.add(prod).finally(() =>
            this._updateProductions()
        );
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