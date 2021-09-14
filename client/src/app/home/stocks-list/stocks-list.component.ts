import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';

import { IStock } from '@global/interfaces/stock.interface';
import { ServerService } from '@services/server.service';
import { StockService } from '@services/stock.service';
import { CStock } from '@interfaces/stock.class';
import { ConfirmModalComponent } from '@shared/confirm-modal/confirm-modal.component';
import { EditAreaModalComponent } from '@shared/edit-area-modal/edit-area-modal.component';
import { EPageStatus } from '@interfaces/root.interface';
import { CServer } from '@interfaces/server.class';

@Component({
    selector: 'app-stocks-list',
    templateUrl: './stocks-list.component.html',
    styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent {
    public stocks: Array<CStock> = [];
    public stockForms: { [stockId: string]: FormControl } = {};
    public isLoading = true;

    constructor(
        private _dialog: MatDialog,
        private _serverService: ServerService,
        private _stockService: StockService,
        private _socket: Socket
    ) {
        this._updateStocks();

        _socket.on(`stock.add`, (stock: IStock) => {
            if (stock._id && (stock.server._id || stock.server) === this._serverService.getCurrentServerId()) {
                this.stocks.push(new CStock(stock));
                this.stockForms[stock._id.toString()] = new FormControl();
            }
        });

        _socket.on(`stock.del`, (stock: IStock) => {
            if (stock.server._id === this._serverService.getCurrentServerId()) {
                this.stocks.remove((stockElem) => stock._id === stockElem._id);
            }
        });

        _socket.on(`stock.edit`, (stockObj: { stock: IStock, doesPrintMsg: boolean }) => {
            const foundStock = this.stocks.find((stockElem) => stockElem._id === stockObj.stock._id);

            if (foundStock) {
                foundStock.server = new CServer(stockObj.stock.server);
                foundStock.name = stockObj.stock.name;
                foundStock.drug = stockObj.stock.drug;
                foundStock.quantity = stockObj.stock.quantity || 0;
                foundStock.screen = stockObj.stock.screen;
            }
        });
    }

    private _updateStocks(): void {
        this._stockService.get().then((result: Array<CStock>) => {
            this.stocks = result;

            this.stocks.forEach((stock) => {
                if (stock._id) {
                    this.stockForms[stock._id.toString()] = new FormControl();
                }
            });
            this.isLoading = false;
        });
    }

    public editStockInfo(stock: CStock): void {
        this._dialog.open(EditAreaModalComponent, {
            minWidth: '40%',
            data: { area: stock, pageStatus: EPageStatus.STOCKS, areaList: this.stocks }
        });
    }

    public editStock(stock: CStock): void {
        if (!stock._id || this.stockForms[stock._id.toString()].invalid) {
            return;
        }
        const quantity: number = this.stockForms[stock._id.toString()].value;
        this.stockForms[stock._id.toString()].reset();
        this._stockService.setStockQuantity(stock, quantity);
    }

    public deleteStock(stock: CStock): void {
        const dialog = this._dialog.open(ConfirmModalComponent, {
            minWidth: '40%',
            data: {
                title: "Supprimer l'entrepôt ?",
                message: `Êtes vous sûr de vouloir supprimer l'entrepôt ${stock.name} ?`,
                confirmButton: "Oui",
                cancelButton: "Non"
            }
        });

        dialog.afterClosed().subscribe((result) => {
            if (result) {
                this._stockService.del(stock);
            }
        });
    }

}