import { NgModule } from '@angular/core';
import { LandingParkingComponent } from './landing-parking.component';
import { landingRoutes } from './landing-parking.routing';
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";
import { LandingDataComponent } from './landing-data/landing-data.component';
import { LandingFeeComponent } from './landing-fee/landing-fee.component';
import { ParkingDataComponent } from './parking-data/parking-data.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';

import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
/*import { ButtonModule } from 'primeng/button';*/
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { AngularSplitModule } from 'angular-split';


import { MatTableExporterModule } from 'mat-table-exporter';
import { MatMenuModule } from '@angular/material/menu';
import { TooltipModule } from '../../../../@boby/components/tooltip/tooltip.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BobyNumberFormatPipeModule } from '../../../../@boby/pipes/number-format/number-format.module';
import { FileHistoryDialogComponent } from './landing-data/file-history-dialog/file-history-dialog.component';
import { ClosingDialogComponent } from './landing-data/closing-dialog/closing-dialog.component';

@NgModule({
    declarations: [
    LandingParkingComponent,
    LandingDataComponent,
    LandingFeeComponent,
    ParkingDataComponent,
    FileHistoryDialogComponent,
    ClosingDialogComponent
    ],
    imports: [
        RouterModule.forChild(landingRoutes),
        SharedModule,

        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSidenavModule,
        MatSelectModule,

        DialogModule,
        //ButtonModule,
        SplitterModule,
        AngularSplitModule,

        ToastModule,
        MatTableExporterModule,
        MatMenuModule,
        TooltipModule,
        MatCheckboxModule,
        InputTextModule,
        InputTextareaModule,
        MatDialogModule,

        BobyNumberFormatPipeModule
    ],
    providers: [MessageService]
})
export class LandingParkingModule { }
