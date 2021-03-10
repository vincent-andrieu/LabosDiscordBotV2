import { Component } from '@angular/core';
import { CStock } from '@interfaces/stock.class';
import { StockService } from '@services/stock.service';

@Component({
    selector: 'app-stocks-list',
    templateUrl: './stocks-list.component.html',
    styleUrls: ['./stocks-list.component.scss']
})
export class StocksListComponent {
    public stocks: Array<CStock> = [];
    public isLoading = true;

    constructor(private _stockService: StockService) {
        _stockService.get().then((result) => {
            this.stocks = result;
            this.isLoading = false;
        });
    }

}