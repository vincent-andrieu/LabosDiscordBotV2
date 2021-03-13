import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ILaboratory } from '@global/interfaces/laboratory.interface';

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
        screen: new FormControl(this.data.area.screen),
        isDefault: new FormControl(((this.data.area.server.defaultLabo as ILaboratory)?._id || this.data.area.server.defaultLabo) === this.data.area._id?.toString())
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
    ) {
        if (((this.data.area.server.defaultLabo as ILaboratory)?._id || this.data.area.server.defaultLabo) === this.data.area._id?.toString()) {
            this.form.controls.isDefault.disable();
        }
    }

    public isAreaEdited(): boolean {
        return this.form.controls.name.value !== this.data.area.name ||
            this.form.controls.drug.value !== this.data.area.drug ||
            this.form.controls.screen.value !== this.data.area.screen;
    }

    public doesSetDefaultLabo(): boolean {
        return (((this.data.area.server.defaultLabo as ILaboratory)?._id || this.data.area.server.defaultLabo) === this.data.area._id?.toString()) !== this.form.controls.isDefault.value;
    }

    public saveArea(): void {
        const isEdited = this.isAreaEdited();
        if (this.form.invalid || this.form.pristine || (!isEdited && !this.doesSetDefaultLabo())) {
            return;
        }
        const doesSetDefaultLabo = this.doesSetDefaultLabo();
        const area = this.data.area;
        area.name = this.form.controls.name.value;
        area.drug = this.form.controls.drug.value;
        area.screen = this.form.controls.screen.value;


        if (this.data.pageStatus === EPageStatus.LABOS) {
            if (isEdited) {
                this._laboratoryService.edit(area as CLaboratory).then((labo) => {
                    if (doesSetDefaultLabo) {
                        this._laboratoryService.setDefault(labo).then(() => this._dialogRef.close());
                    } else {
                        this._dialogRef.close();
                    }
                });
            } else {
                if (doesSetDefaultLabo) {
                    this._laboratoryService.setDefault(this.data.area as CLaboratory).then(() => this._dialogRef.close());
                } else {
                    this._dialogRef.close();
                }
            }
        }
        if (this.data.pageStatus === EPageStatus.STOCKS && area !== this.data.area) {
            this._stockService.edit(area as CStock).then(() =>
                this._dialogRef.close()
            );
        }
    }

}