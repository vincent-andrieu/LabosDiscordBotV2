import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ValidatorsService } from '@services/validators.service';
import { ServerService } from '@services/server.service';
import { LaboratoryService } from '@services/laboratory.service';
import { StockService } from '@services/stock.service';
import { EPageStatus } from '@interfaces/root.interface';
import { CServer } from '@interfaces/server.class';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';

@Component({
    selector: 'app-create-area-modal',
    templateUrl: './create-area-modal.component.html',
    styleUrls: ['./create-area-modal.component.scss']
})
export class CreateAreaModalComponent {
    public form = new FormGroup({
        name: new FormControl("", [
            Validators.required,
            this._validatorsService.doesHaveSpacesValidator(),
            this._validatorsService.doesAlreadyExistValidator(this.data.ePageStatus, this.data.areaList)
        ]),
        drug: new FormControl("", [
            Validators.required,
            this._validatorsService.isADrugOrStuffValidator(this.data.ePageStatus)
        ]),
        screen: new FormControl(''),
        isDefault: new FormControl()
    });
    public server?: CServer;
    public ePageStatus = EPageStatus;

    constructor(
        private _dialogRef: MatDialogRef<CreateAreaModalComponent, void>,
        @Inject(MAT_DIALOG_DATA) public data: {
            ePageStatus: EPageStatus,
            areaList: Array<CLaboratory | CStock>
        },
        private _validatorsService: ValidatorsService,
        private _serverService: ServerService,
        private _laboratoryService: LaboratoryService,
        private _stockService: StockService
    ) {
        this._serverService.getCurrentServer().then((result: CServer) => this.server = result);
    }

    public addArea(): void {
        if (this.form.invalid || !this.server) {
            return;
        }

        const area = {
            server: this.server,
            name: this.form.controls.name.value,
            drug: this.form.controls.drug.value,
            screen: this.form.controls.screen.value
        };

        if (this.data.ePageStatus === EPageStatus.LABOS) {
            this._laboratoryService.add(new CLaboratory(area)).then((labo) => {
                if (this.form.controls.isDefault.value) {
                    this._laboratoryService.setDefault(labo).then(() => this._dialogRef.close());
                } else {
                    this._dialogRef.close();
                }
            });
        } else if (this.data.ePageStatus === EPageStatus.STOCKS) {
            this._stockService.add(new CStock(area)).then(() => this._dialogRef.close());
        }
    }

}