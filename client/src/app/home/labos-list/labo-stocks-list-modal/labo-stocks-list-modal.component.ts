import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GlobalConfig } from '@global/config';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';
import { LaboratoryService } from '@services/laboratory.service';
import { StockService } from '@services/stock.service';

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
        private _dialogRef: MatDialogRef<LaboStocksListModalComponent>,
        @Inject(MAT_DIALOG_DATA) public laboratory: CLaboratory,
        private _laboratoryService: LaboratoryService,
        private _stockService: StockService
    ) {}

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
        this._stockService.del(stock).finally(() =>
            this._updateLaboDrugStocks()
        );
    }

}