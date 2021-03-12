import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { isADrug, isADrugOrStuff } from "@global/utils";
import { EPageStatus } from '@interfaces/root.interface';
import { CLaboratory } from '@interfaces/laboratory.class';
import { CStock } from '@interfaces/stock.class';


@Injectable({
    providedIn: 'root'
})
export class ValidatorsService {

    public doesHaveSpacesValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const controlValue: string = control.value;

            for (const char of controlValue) {
                if (char === " ") {
                    return { 'spaces': true };
                }
            }
            return null;
        };
    }

    public doesAlreadyExistValidator(pageStatus: EPageStatus, areaList: Array<CLaboratory | CStock> | undefined, areaName?: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const controlValue: string = control.value.toLowerCase().trim();
            const value = areaList?.find((value) => value.name.toLowerCase() === controlValue);

            if (areaList === undefined || (value && (!areaName || value.name.toLowerCase() !== areaName.toLowerCase()))) {
                if (pageStatus === EPageStatus.LABOS) {
                    return { 'laboExist': true };
                } else {
                    return { 'stockExist': true };
                }
            }
            return null;
        };
    }

    public isADrugOrStuffValidator(pageStatus: EPageStatus): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {

            if (pageStatus === EPageStatus.STOCKS) {
                if (isADrugOrStuff(control.value)) {
                    return null;
                }
                return { 'drugOrStuff': true };
            }
            if (pageStatus === EPageStatus.LABOS) {
                if (isADrug(control.value)) {
                    return null;
                }
                return { 'drug': true };
            }
            return null;
        };
    }
}