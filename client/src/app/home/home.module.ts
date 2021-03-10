import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { HomeComponent } from './home.component';
import { LabosListComponent } from './labos-list/labos-list.component';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
    declarations: [
        HomeComponent,
        LabosListComponent,
        StocksListComponent,
        SidenavComponent
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        FlexLayoutModule,

        MatSidenavModule,
        MatTabsModule,
        MatBadgeModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule
    ]
})
export class HomeModule {}