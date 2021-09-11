import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CookieModule } from 'ngx-cookie';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '@environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { AdminPanelModule } from './admin-panel/admin-panel.module';
import { SharedModule } from './shared/shared.module';
import { AuthComponent } from './auth/auth.component';

const socketConfig: SocketIoConfig = { url: environment.sockets.url, options: {} };

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        HttpClientModule,

        CookieModule.forRoot(),
        SocketIoModule.forRoot(socketConfig),

        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSnackBarModule,
        MatButtonModule,
        MatIconModule,

        HomeModule,
        AdminPanelModule,
        SharedModule
    ],
    bootstrap: [AppComponent],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } }
    ]
})
export class AppModule {}