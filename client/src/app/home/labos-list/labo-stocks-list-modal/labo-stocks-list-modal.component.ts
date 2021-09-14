import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';

import { GlobalConfig } from '@global/config';
import { ILaboratory } from '@global/interfaces/laboratory.interface';
import { IStock } from '@global/interfaces/stock.interface';
import { ServerService } from '@services/server.service';
import { LaboratoryService } from '@services/laboratory.service';
import { StockService } from '@services/stock.service';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';

@Component({
    selector: 'app-labo-stocks-list-modal',
    templateUrl: './labo-stocks-list-modal.component.html',
    styleUrls: ['./labo-stocks-list-modal.component.scss']
})
export class LaboStocksListModalComponent {
    public displayedColumns = ['name', 'drug', 'quantity', 'actions'];
    public laboDrugStocks: Array<CStock> = [];
    public newStockToLabo = new FormControl({}, Validators.required);
    public isLoading = true;

    constructor(
        private _dialogRef: MatDialogRef<LaboStocksListModalComponent, void>,
        @Inject(MAT_DIALOG_DATA) public laboratory: CLaboratory,
        private _laboratoryService: LaboratoryService,
        private _stockService: StockService,
        _socket: Socket
    ) {
        this.laboratory.stocks.sort((first: CStock, second: CStock) => first.name.localeCompare(second.name));
        this._updateLaboDrugStocks();

        _socket.on(`labo.del`, (labo: ILaboratory) => {
            if (this.laboratory._id === labo._id) {
                this._dialogRef.close();
            }
        });

        _socket.on(`labo.edit`, (labo: ILaboratory) => {
            if (this.laboratory._id === labo._id) {
                this.laboratory.server = new CServer(labo.server);
                this.laboratory.name = labo.name;
                this.laboratory.drug = labo.drug;
                this.laboratory.stocks = labo.stocks?.map((stock) => new CStock(stock)) || [];
                this.laboratory.quantity = labo.quantity || 0;
                this.laboratory.screen = labo.screen;
            }
        });

        _socket.on(`labo.addStock`, () => {
            this._updateLaboDrugStocks();
        });

        _socket.on(`labo.delStock`, () => {
            this._updateLaboDrugStocks();
        });

        _socket.on(`stock.del`, () => {
            this._updateLaboDrugStocks();
        });

        _socket.on(`stock.edit`, (stockObj: { stock: IStock, doesPrintMsg: boolean }) => {
            const foundStock = this.laboDrugStocks.find((stockElem) => stockElem._id === stockObj.stock._id);

            if (foundStock) {
                foundStock.server = new CServer(stockObj.stock.server);
                foundStock.name = stockObj.stock.name;
                foundStock.drug = stockObj.stock.drug;
                foundStock.quantity = stockObj.stock.quantity || 0;
                foundStock.screen = stockObj.stock.screen;
            }
        });
    }

    private _updateLaboDrugStocks(): void {
        const laboDrugs = GlobalConfig.productions.drugs[this.laboratory.drug].recipe;

        this._stockService.get().then((stocks: Array<CStock>) => {
            this.laboDrugStocks = [];
            laboDrugs.forEach((drug) => {
                this.laboDrugStocks.push(...stocks.filter((stock) => stock.drug === drug.name));
            });
            this.laboDrugStocks.push(...stocks.filter((stock) => stock.drug === this.laboratory.drug));
            this.laboratory.stocks.forEach((laboStock) => {
                function getStockIndex(laboDrugStocks: Array<CStock>): number {
                    return laboDrugStocks.findIndex((stock) => laboStock.drug === stock.drug);
                }

                for (let stockIndex = getStockIndex(this.laboDrugStocks); stockIndex !== -1; stockIndex = getStockIndex(this.laboDrugStocks)) {
                    if (stockIndex !== -1) {
                        this.laboDrugStocks.splice(stockIndex, 1);
                    }
                }

            });
            this.laboratory.stocks.sort((first: CStock, second: CStock) => first.name.localeCompare(second.name));
            this.laboDrugStocks.sort((first: CStock, second: CStock) => first.name.localeCompare(second.name));
            this.isLoading = false;
        }).catch(() => this._dialogRef.close());
    }

    public addStockToLabo(): void {
        if (this.newStockToLabo.invalid) {
            return;
        }

        this._laboratoryService.addStock(this.laboratory, this.newStockToLabo.value).finally(() =>
            this.newStockToLabo.reset()
        );
    }

    public deleteStockFromLabo(stock: CStock): void {
        this._laboratoryService.delStock(this.laboratory, stock).then((deletedStock) =>
            this.laboDrugStocks.remove((stockElem) => stockElem._id === deletedStock._id)
        );
    }

}