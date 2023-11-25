import { NgModule } from '@angular/core';
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../../shared/shared.module";
import { ParametricsComponent } from './parametrics.component';
import { EntityComponent } from './entity/entity.component';
import { parametricsRoutes } from "./parametrics.routing";
import { AtoCategoriesComponent } from './ato-categories/ato-categories.component';
import { RateLandingComponent } from './rate-landing/rate-landing.component';

import { MessageService } from 'primeng/api';

import { TreeTableModule } from 'primeng/treetable';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';


import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';

import { SpeedDialModule } from 'primeng/speeddial';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { TableModule } from 'primeng/table';

import { MultiSelectModule } from 'primeng/multiselect';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AircraftWeightComponent } from './aircraft-weight/aircraft-weight.component';
import { RateSurchargesComponent } from './rate-surcharges/rate-surcharges.component';
import { RateParkingComponent } from './rate-parking/rate-parking.component';

import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { OrganizationChartModule } from 'primeng/organizationchart';

import { TreeDragDropService } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { TabMenuModule } from 'primeng/tabmenu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableExporterModule } from 'mat-table-exporter';

@NgModule({
    declarations: [
    ParametricsComponent,
    EntityComponent,
    AtoCategoriesComponent,
    RateLandingComponent,
    AircraftWeightComponent,
    RateSurchargesComponent,
    RateParkingComponent
    ],
    imports: [
        RouterModule.forChild(parametricsRoutes),
        SharedModule,
        TreeTableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        MessageModule,
        MessagesModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        SpeedDialModule,
        MenuModule,
        MenubarModule,
        TableModule,
        MultiSelectModule,

        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatTooltipModule,
        MatTableModule,
        MatSidenavModule,
        MatMenuModule,
        MatSelectModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgxMatTimepickerModule.setLocale('es-BO'),
        OrganizationChartModule,
        TreeModule,
        TabMenuModule,
        MatTabsModule,
        MatTableExporterModule
    ],
    providers: [MessageService, TreeDragDropService]
})
export class ParametricsModule { }
