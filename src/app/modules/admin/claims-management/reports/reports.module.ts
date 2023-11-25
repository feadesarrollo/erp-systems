import { NgModule } from '@angular/core';
import { ReportsComponent } from './reports.component';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from "@angular/router";
import { reportsRoutes } from './reports.routing';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableExporterModule } from 'mat-table-exporter';

import { NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { CrmGlobalComponent } from './crm-global/crm-global.component';
import { ClaimBookComponent } from './claim-book/claim-book.component';
import { AnswerBookComponent } from './answer-book/answer-book.component';




@NgModule({
  declarations: [

    ReportsComponent,
     CrmGlobalComponent,
     ClaimBookComponent,
     AnswerBookComponent
  ],
  imports: [
      RouterModule.forChild(reportsRoutes),
      SharedModule,

      MatFormFieldModule,
      MatIconModule,
      MatButtonModule,
      MatInputModule,
      MatPaginatorModule,
      MatSortModule,
      MatTooltipModule,
      MatTableModule,
      MatSelectModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatAutocompleteModule,

      NgApexchartsModule,
      MatButtonToggleModule,
      MatMenuModule,
      MatProgressBarModule,
      MatTableExporterModule
  ]
})
export class ReportsModule { }
