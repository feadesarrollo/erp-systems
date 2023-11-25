import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { SharedModule } from '../../../../shared/shared.module';

import { ToastModule } from 'primeng/toast';

import { DialogModule } from 'primeng/dialog';


import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';

import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableExporterModule } from 'mat-table-exporter';

import { MessageService } from 'primeng/api';

import { settingsRoutes } from "./settings.routing";

import { SettingsComponent } from './settings.component';

import { CustomerComponent } from './customer/customer.component';
import { CompensationComponent } from './compensation/compensation.component';
import { HolidayComponent } from './holiday/holiday.component';
import { HalfClaimComponent } from './half-claim/half-claim.component';
import { CancellationReasonComponent } from './cancellation-reason/cancellation-reason.component';
import { IncidentTypeComponent } from './incident-type/incident-type.component';
import { OfficeComponent } from './office/office.component';
import { CustomerDialogComponent } from './customer/customer-dialog/customer-dialog.component';
import { HolidayDialogComponent } from './holiday/holiday-dialog/holiday-dialog.component';
import { HalfClaimDialogComponent } from './half-claim/half-claim-dialog/half-claim-dialog.component';
import { CompensationDialogComponent } from './compensation/compensation-dialog/compensation-dialog.component';
import { CancellationReasonDialogComponent } from './cancellation-reason/cancellation-reason-dialog/cancellation-reason-dialog.component';
import { OfficeDialogComponent } from './office/office-dialog/office-dialog.component';

import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { CustomerDetailsComponent } from './customer/customer-details/customer-details.component';

@NgModule({
    declarations: [
        SettingsComponent,
        CustomerComponent,
        CompensationComponent,
        HolidayComponent,
        HalfClaimComponent,
        CancellationReasonComponent,
        IncidentTypeComponent,
        OfficeComponent,
        CustomerDialogComponent,
        HolidayDialogComponent,
        HalfClaimDialogComponent,
        CompensationDialogComponent,
        CancellationReasonDialogComponent,
        OfficeDialogComponent,
        CustomerListComponent,
        CustomerDetailsComponent

    ],
    imports: [
        SharedModule,
        RouterModule.forChild(settingsRoutes),

        ToastModule,

        DragDropModule,
        CdkStepperModule,
        CdkTableModule,
        CdkTreeModule,

        MatDialogModule,
        MatTableModule,
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatMenuModule,
        MatSidenavModule,
        MatProgressBarModule,
        MatTreeModule,
        DialogModule,
        MatCheckboxModule,
        MatTableExporterModule
    ],
    providers:[
        MessageService
    ]

})
export class SettingsModule { }
