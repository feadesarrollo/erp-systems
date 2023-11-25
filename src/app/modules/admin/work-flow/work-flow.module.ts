import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkFlowComponent } from './work-flow.component';
import { RouterModule } from "@angular/router";
import { workFlowRoutes } from "../work-flow/work-flow.routing";
import { SharedModule } from "../../../shared/shared.module";

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { WorkFlowListComponent } from './work-flow-list/work-flow-list.component';
import { WorkFlowDetailsComponent } from './work-flow-details/work-flow-details.component';



@NgModule({
    declarations: [
        WorkFlowComponent,
        WorkFlowListComponent,
        WorkFlowDetailsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(workFlowRoutes),
        SharedModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        MatTableExporterModule,
        MatPaginatorModule,
        MatSelectModule,

        ToastModule
    ],
    providers: [
        MessageService
    ]
})
export class WorkFlowModule { }
