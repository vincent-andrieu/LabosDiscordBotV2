import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';

import { AdminService } from '@services/admin.service';
import { SnackbarService } from '@services/snackbar.service';
import { CServer } from '@interfaces/server.class';
import { ConfirmModalComponent } from '@shared/confirm-modal/confirm-modal.component';

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent {
    public servers: Array<CServer> = [];
    public isLoading = true;

    constructor(
        private _location: Location,
        private _dialog: MatDialog,
        private _snackbarService: SnackbarService,
        private _adminService: AdminService
    ) {
        this._adminService.getServers()
            .then((result) => {
                this.servers = result;
                this.isLoading = false;
            })
            .catch((err: HttpErrorResponse | string) => {
                if (typeof err === 'string') {
                    this._snackbarService.openCustomError(err);
                    this._location.back();
                } else {
                    this._snackbarService.openError(err);
                }
            });
    }

    public deleteServer(server: CServer): void {
        const dialog = this._dialog.open(ConfirmModalComponent, {
            minWidth: '40%',
            data: {
                title: `Supprimer le serveur ${server.name} ?`,
                message: `Toutes les données qui lui sont liées seront supprimées avec.`,
                confirmButton: "Oui",
                cancelButton: "Non"
            }
        });

        dialog.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this._adminService.deleteServer(server)
                    .then(() => {
                        this.servers.remove((serverElem) => server._id === serverElem._id);
                        this._snackbarService.open("Serveur supprimé");
                    })
                    .catch((err) => this._snackbarService.openError(err));
            }
        });
    }

}