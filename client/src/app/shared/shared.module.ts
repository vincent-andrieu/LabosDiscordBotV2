import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { EditAreaModalComponent } from './edit-area-modal/edit-area-modal.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { CreateAreaModalComponent } from './create-area-modal/create-area-modal.component';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';
import { EditLocationModalComponent } from './edit-location-modal/edit-location-modal.component';

@NgModule({
    declarations: [
        EditAreaModalComponent,
        ConfirmModalComponent,
        CreateAreaModalComponent,
        SettingsModalComponent,
        EditLocationModalComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,

        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatNativeDateModule,

        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatIconModule
    ],
    providers: [
        { provide: LOCALE_ID, useValue: 'fr' },
        { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }
    ]
})
export class SharedModule {}