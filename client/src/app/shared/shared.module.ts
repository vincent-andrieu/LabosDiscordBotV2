import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { EditAreaModalComponent } from './edit-area-modal/edit-area-modal.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { CreateAreaModalComponent } from './create-area-modal/create-area-modal.component';
import { SettingsModalComponent } from './settings-modal/settings-modal.component';

@NgModule({
    declarations: [
        EditAreaModalComponent,
        ConfirmModalComponent,
        CreateAreaModalComponent,
        SettingsModalComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,

        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatSlideToggleModule
    ]
})
export class SharedModule {}