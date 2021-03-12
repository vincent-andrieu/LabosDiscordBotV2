import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';

import { HomeComponent } from './home.component';
import { LabosListComponent } from './labos-list/labos-list.component';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { LaboStocksListModalComponent } from './labos-list/labo-stocks-list-modal/labo-stocks-list-modal.component';

@NgModule({
    declarations: [
        HomeComponent,
        LabosListComponent,
        StocksListComponent,
        SidenavComponent,
        LaboStocksListModalComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,

        MatSidenavModule,
        MatTabsModule,
        MatBadgeModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatDialogModule,
        MatTableModule,
        MatSelectModule
    ]
})
export class HomeModule {}