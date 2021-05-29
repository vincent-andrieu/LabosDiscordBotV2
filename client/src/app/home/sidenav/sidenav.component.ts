import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LaboratoryService } from '@services/laboratory.service';
import { StockService } from '@services/stock.service';
import { LocationService } from '@services/location.service';
import { EPageStatus } from '@interfaces/root.interface';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';
import { CLocation } from '@interfaces/location.class';
import { CreateAreaModalComponent } from '@shared/create-area-modal/create-area-modal.component';
import { SettingsModalComponent } from '@shared/settings-modal/settings-modal.component';
import { EditLocationModalComponent } from '@shared/edit-location-modal/edit-location-modal.component';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
    @Input() public pageStatus?: EPageStatus;
    @Input() public serverName?: string;
    public ePageStatus = EPageStatus;

    constructor(
        private _dialog: MatDialog,
        private _laboratoryService: LaboratoryService,
        private _stockService: StockService,
        private _locationService: LocationService
    ) {}

    public openSettingsModal(): void {
        this._dialog.open(SettingsModalComponent, {
            minWidth: '40%'
        });
    }

    public addAreaModal(): void {
        if (this.pageStatus === EPageStatus.LOCATIONS) {
            this._locationService.get().then((result: Array<CLocation>) =>
                this._dialog.open(EditLocationModalComponent, {
                    minWidth: '40%',
                    data: {
                        isCreate: true,
                        list: result
                    }
                })
            );
            return;
        }

        const pageStatusService = this.pageStatus === EPageStatus.LABOS ? this._laboratoryService : this._stockService;

        pageStatusService.get().then((result: Array<CLaboratory | CStock>) =>
            this._dialog.open(CreateAreaModalComponent, {
                minWidth: '40%',
                data: {
                    ePageStatus: this.pageStatus,
                    areaList: result
                }
            })
        );
    }

}