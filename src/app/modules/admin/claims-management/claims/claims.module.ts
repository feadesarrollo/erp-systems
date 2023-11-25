import { NgModule } from '@angular/core';
import { ClaimsComponent } from './claims.component';

import { RouterModule } from "@angular/router";
import { SharedModule } from 'app/shared/shared.module';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BobyFindByKeyPipeModule } from '@boby/pipes/find-by-key';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { EditorModule, TINYMCE_SCRIPT_SRC  } from '@tinymce/tinymce-angular';

import { BobyCardModule } from '@boby/components/card';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { ClaimComponent } from './claim/claim.component';
import { claimsRoutes } from "./claims.routing";
import { ClaimDialogComponent } from './claim/claim-dialog/claim-dialog.component';
import { WizardDialogComponent } from './claim/wizard-dialog/wizard-dialog.component';
import { ClaimDetailsComponent } from './claim/claim-details/claim-details.component';
import { ClaimListComponent } from './claim/claim-list/claim-list.component';
import { ClaimReportComponent } from './claim/claim-report/claim-report.component';
import { ClaimComplaintComponent } from './claim/claim-complaint/claim-complaint.component';

import { ClaimFilesComponent } from './claim/claim-files/claim-files.component';
import { ClaimAnswerComponent } from './claim/claim-answer/claim-answer.component';
import { ClaimGanttComponent } from './claim/claim-gantt/claim-gantt.component';
import { ClaimReportDialogComponent } from './claim/claim-report/claim-report-dialog/claim-report-dialog.component';
import { ClaimAnswerDialogComponent } from './claim/claim-answer/claim-answer-dialog/claim-answer-dialog.component';
import { UploadFileComponent } from './claim/claim-files/upload-file/upload-file.component';
import { FileDetailComponent } from './claim/claim-files/file-detail/file-detail.component';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { QuillModule } from 'ngx-quill';

import { BobyScrollbarModule } from '@boby/directives/scrollbar';
import { AnswerComponent } from './answer/answer.component';
import { AnswerListComponent } from './answer/answer-list/answer-list.component';
import { ClaimContainerDialogComponent } from './claim/claim-container-dialog/claim-container-dialog.component';
import { PreviousDialogComponent } from './claim/previous-dialog/previous-dialog.component';
import { ClaimMailComposeComponent } from './claim/claim-mail-compose/claim-mail-compose.component';

import { ClaimGanttDocumentComponent } from './claim/claim-gantt/claim-gantt-document/claim-gantt-document.component';
import { AnswerDetailsComponent } from './answer/answer-details/answer-details.component';
import { AnswerTemplateComponent } from './answer/answer-template/answer-template.component';
import { ClaimRipatComponent } from './claim/claim-ripat/claim-ripat.component';

@NgModule({
    declarations: [
        ClaimsComponent,
        ClaimComponent,
        ClaimDialogComponent,
        WizardDialogComponent,
        ClaimDetailsComponent,
        ClaimListComponent,
        ClaimReportComponent,
        ClaimComplaintComponent,
        ClaimFilesComponent,
        ClaimAnswerComponent,
        ClaimGanttComponent,
        ClaimReportDialogComponent,
        ClaimAnswerDialogComponent,
        UploadFileComponent,
        FileDetailComponent,
        AnswerComponent,
        AnswerListComponent,
        ClaimContainerDialogComponent,
        PreviousDialogComponent,
        ClaimMailComposeComponent,
        ClaimGanttDocumentComponent,
        AnswerDetailsComponent,
        AnswerTemplateComponent,
        ClaimRipatComponent
    ],
    imports: [
        RouterModule.forChild(claimsRoutes),
        SharedModule,

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        BobyFindByKeyPipeModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatTabsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRippleModule,
        MatPaginatorModule,
        MatSortModule,
        MatStepperModule,
        DragDropModule,
        MatTableModule,
        MatCardModule,
        MatCheckboxModule,
        MatMenuModule,

        QuillModule.forRoot(),
        NgxDocViewerModule,
        InfiniteScrollModule,

        NgxMatDatetimePickerModule,
        NgxMatTimepickerModule,
        NgxMatMomentModule,
        QuillModule.forRoot(),

        BobyScrollbarModule,

        EditorModule,
        BobyCardModule,
        MatTableExporterModule,
        MatButtonToggleModule
    ],
    providers: [
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ]
})
export class ClaimsModule { }
