import { NgModule } from '@angular/core';

import { ClaimsManagementComponent } from './claims-management.component';
import { SharedModule } from '../../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { claimManagementRoutes } from './claims-management.routing';

//import { BobyLoadingService } from "@boby/services/loading";

/*import { TableModule } from 'primeng/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';*/


@NgModule({
    declarations: [
        ClaimsManagementComponent
    ],
    imports: [
        RouterModule.forChild(claimManagementRoutes),
        SharedModule,

        /*TableModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule*/
    ]/*,
    providers: [
        BobyLoadingService
    ]*/
})
export class ClaimsManagementModule { }
