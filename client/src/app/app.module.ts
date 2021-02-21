import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CookieModule } from 'ngx-cookie';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LabosListComponent } from './labos-list/labos-list.component';
import { StocksListComponent } from './stocks-list/stocks-list.component';
import { SidenavComponent } from './sidenav/sidenav.component';

@NgModule({
    declarations: [
        AppComponent,
        LabosListComponent,
        StocksListComponent,
        SidenavComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexLayoutModule,

        CookieModule.forRoot(),

        MatSidenavModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
        MatBadgeModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }