import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { SharedModule } from '../../../../shared/shared.module';

import { ToastModule } from 'primeng/toast';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';

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
import { adminRoutes } from "../administrator/administrator.routing";
import { MessageService } from "primeng/api";

import { EditorModule, TINYMCE_SCRIPT_SRC  } from '@tinymce/tinymce-angular';

import { AdministratorComponent } from './administrator.component';

import { ParametersComponent } from './parameters/parameters.component';
import { ParametersDialogComponent } from './parameters/parameters-dialog/parameters-dialog.component';

import { RolesComponent } from './roles/roles.component';
import { RoleListComponent } from './roles/role-list/role-list.component';
import { RoleDetailsComponent } from './roles/role-details/role-details.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { FileManagerListComponent } from './file-manager/file-manager-list/file-manager-list.component';
import { FileManagerDetailsComponent } from './file-manager/file-manager-details/file-manager-details.component';
import { FileManagerViewComponent } from './file-manager/file-manager-view/file-manager-view.component';
import { GroupEmailsComponent } from './group-emails/group-emails.component';
import { GroupEmailsDialogComponent } from './group-emails/group-emails-dialog/group-emails-dialog.component';

@NgModule({
    declarations: [
        AdministratorComponent,
        ParametersComponent,
        ParametersDialogComponent,
        RolesComponent,
        RoleListComponent,
        RoleDetailsComponent,
        FileManagerComponent,
        FileManagerListComponent,
        FileManagerDetailsComponent,
        FileManagerViewComponent,
        GroupEmailsComponent,
        GroupEmailsDialogComponent
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(adminRoutes),
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
        MatCheckboxModule,
        MatTableExporterModule,
        EditorModule
    ],
    providers:[
        MessageService,
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ]
})
export class AdministratorModule { }
