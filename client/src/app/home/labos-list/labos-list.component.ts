import { Component } from '@angular/core';
import { CLaboratory } from '@interfaces/laboratory.class';
import { LaboratoryService } from '@services/laboratory.service';

@Component({
    selector: 'app-labos-list',
    templateUrl: './labos-list.component.html',
    styleUrls: ['./labos-list.component.scss']
})
export class LabosListComponent {
    public laboratories: Array<CLaboratory> = [];
    public isLoading = true;

    constructor(private _laboratoryService: LaboratoryService) {
        _laboratoryService.get().then((result) => {
            this.laboratories = result;
            this.isLoading = false;
        });
    }

}