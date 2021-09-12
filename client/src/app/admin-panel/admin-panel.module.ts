import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from 'app/app-routing.module';
import { AdminPanelComponent } from './admin-panel.component';

@NgModule({
    declarations: [
        AdminPanelComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexLayoutModule,

        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule
    ]
})
export class AdminPanelModule { }