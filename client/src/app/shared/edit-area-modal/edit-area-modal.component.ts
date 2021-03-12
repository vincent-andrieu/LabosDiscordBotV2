import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CLaboratory } from '@interfaces/laboratory.class';
import { EPageStatus } from '@interfaces/root.interface';
import { CStock } from '@interfaces/stock.class';
import { LaboratoryService } from '@services/laboratory.service';
import { StockService } from '@services/stock.service';
import { ValidatorsService } from '@services/validators.service';

@Component({
    selector: 'app-edit-area-modal',
    templateUrl: './edit-area-modal.component.html',
    styleUrls: ['./edit-area-modal.component.scss']
})
export class EditAreaModalComponent {
    public ePageStatus = EPageStatus;
    public form = new FormGroup({
        name: new FormControl(this.data.area.name, [
            Validators.required,
            this._validatorsService.doesHaveSpacesValidator(),
            this._validatorsService.doesAlreadyExistValidator(this.data.pageStatus, this.data.areaList, this.data.area.name)
        ]),
        drug: new FormControl(this.data.area.drug, [
            Validators.required,
            this._validatorsService.isADrugOrStuffValidator(this.data.pageStatus)
        ]),
        screen: new FormControl(this.data.area.screen)
    })

    constructor(
        private _dialogRef: MatDialogRef<EditAreaModalComponent, void>,
        @Inject(MAT_DIALOG_DATA) public data: {
            area: CLaboratory | CStock;
            pageStatus: EPageStatus,
            areaList: Array<CLaboratory | CStock>
        },
        private _validatorsService: ValidatorsService,
        private _laboratoryService: LaboratoryService,
        private _stockService: StockService
    ) {}

    public saveArea(): void {
        if (this.form.invalid) {
            return;
        }
        const area = this.data.area;
        area.name = this.form.controls.name.value;
        area.drug = this.form.controls.drug.value;
        area.screen = this.form.controls.screen.value;

        if (this.data.pageStatus === EPageStatus.LABOS) {
            this._laboratoryService.edit(area as CLaboratory).then(() =>
                this._dialogRef.close()
            );
        }
        if (this.data.pageStatus === EPageStatus.STOCKS) {
            this._stockService.edit(area as CStock).then(() =>
                this._dialogRef.close()
            );
        }
    }

}