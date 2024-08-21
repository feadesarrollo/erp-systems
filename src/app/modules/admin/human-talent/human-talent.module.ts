import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../../shared/shared.module";

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatTableExporterModule } from 'mat-table-exporter';
import { BobyCardModule } from '@boby/components/card';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatBadgeModule } from '@angular/material/badge';

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { MessageService, TreeDragDropService } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { humanTalentRoutes } from "./human-talent.routing";

import { HumanTalentComponent } from './human-talent.component';
import { OrganizationComponent } from "./settings/organization/organization.component";
import { OrgChartComponent } from './org-chart/org-chart.component';
import { HumanTalentMenuComponent } from './human-talent-menu/human-talent-menu.component';
import { OfficeComponent } from './settings/office/office.component';
import { HeadboardComponent } from './headboard/headboard.component';
import { OfficialsComponent } from './processes/officials/officials.component';
import { OrganizationChartComponent } from './settings/organization-chart/organization-chart.component';
import { AlcoholControlComponent } from './processes/alcohol-control/alcohol-control.component';
import { AlcoholControlDialogComponent } from './processes/alcohol-control/alcohol-control-dialog/alcohol-control-dialog.component';
import { ListLotteryControlComponent } from './processes/alcohol-control/list-lottery-control/list-lottery-control.component';
import { OrganizationChartSelectionComponent } from './processes/alcohol-control/organization-chart-selection/organization-chart-selection.component';
import { TestTypeComponent } from './processes/alcohol-control/test-type/test-type.component';
import { DetailsOfficialsComponent } from './processes/alcohol-control/details-officials/details-officials.component';
import { TestTypeDialogComponent } from './processes/alcohol-control/test-type/test-type-dialog/test-type-dialog.component';
import { DetailsOfficialsDialogComponent } from './processes/alcohol-control/details-officials/details-officials-dialog/details-officials-dialog.component';
import { ViewDocumentDialogComponent } from './processes/alcohol-control/details-officials/view-document-dialog/view-document-dialog.component';
import { OfficialDialogComponent } from './processes/officials/official-dialog/official-dialog.component';
import { OfficialsPsychoactiveComponent } from './processes/officials/officials-psychoactive/officials-psychoactive.component';
import { OfficialsPsychoactiveDialogComponent } from './processes/officials/officials-psychoactive/officials-psychoactive-dialog/officials-psychoactive-dialog.component';
import { AlcoholControlGanttComponent } from './processes/alcohol-control/alcohol-control-gantt/alcohol-control-gantt.component';
import { ViewDocGenDialogComponent } from './processes/alcohol-control/view-doc-gen-dialog/view-doc-gen-dialog.component';
import { TestQueryComponent } from './processes/alcohol-control/test-query/test-query.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { ClassifiersComponent } from './classifiers/classifiers.component';
import { PermissionsListComponent } from './permissions/permissions-list/permissions-list.component';
import { PermissionsDetailsComponent } from './permissions/permissions-details/permissions-details.component';
import { ClassifiersDialogComponent } from './classifiers/classifiers-dialog/classifiers-dialog.component';
import { TicketRequestComponent } from './processes/ticket-request/ticket-request.component';
import { OrganizationChartTicketComponent } from './processes/ticket-request/organization-chart-ticket/organization-chart-ticket.component';
import { OrganigramaComponent } from './processes/organigrama/organigrama.component';
import { OrganizationChartListComponent } from './settings/organization-chart/organization-chart-list/organization-chart-list.component';
import { OrganizationChartDetailsComponent } from './settings/organization-chart/organization-chart-details/organization-chart-details.component';
import { OrganizationChartDialogComponent } from './settings/organization-chart/organization-chart-dialog/organization-chart-dialog.component';
import { OrganizationChartItemComponent } from './settings/organization-chart/organization-chart-item/organization-chart-item.component';
import { OrganizationChartAllocationComponent } from './settings/organization-chart/organization-chart-allocation/organization-chart-allocation.component';
import { SummativeProcessesComponent } from './processes/ticket-request/summative-processes/summative-processes.component';
import { SummativeProcessesListComponent } from './processes/ticket-request/summative-processes/summative-processes-list/summative-processes-list.component';
import { SummativeProcessesDetailsComponent } from './processes/ticket-request/summative-processes/summative-processes-details/summative-processes-details.component';
import { ItemHistoryComponent } from './processes/ticket-request/organization-chart-ticket/item-history/item-history.component';
import { OrganizationChartItemDialogComponent } from './settings/organization-chart/organization-chart-item/organization-chart-item-dialog/organization-chart-item-dialog.component';
import { OrganizationChartItemDetailsComponent } from './settings/organization-chart/organization-chart-item-details/organization-chart-item-details.component';
import { FileManagerComponent } from './settings/file-manager/file-manager.component';
import { FileManagerListComponent } from './settings/file-manager/file-manager-list/file-manager-list.component';
import { FileManagerDetailsComponent } from './settings/file-manager/file-manager-details/file-manager-details.component';
import { FileManagerViewComponent } from './settings/file-manager/file-manager-view/file-manager-view.component';

import { EditorModule, TINYMCE_SCRIPT_SRC  } from '@tinymce/tinymce-angular';
import { DocumentViewerComponent } from './settings/organization-chart/organization-chart-allocation/document-viewer/document-viewer.component';
import { ControlBudgetComponent } from './processes/control-budget/control-budget.component';

import { TreeTableModule } from 'primeng/treetable';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';

import { ControlBudgetListComponent } from './processes/control-budget/control-budget-list/control-budget-list.component';
import { ControlBudgetDetailsComponent } from './processes/control-budget/control-budget-details/control-budget-details.component';
import { OperationalBaseComponent } from './settings/operational-base/operational-base.component';
import { MatChipsModule } from '@angular/material/chips';
import { TestOrganizationComponent } from './processes/alcohol-control/test-organization/test-organization.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ManualTestDialogComponent } from './processes/alcohol-control/manual-test-dialog/manual-test-dialog.component';
@NgModule({
    declarations: [
        HumanTalentComponent,
        OrganizationComponent,
        OrgChartComponent,
        HumanTalentMenuComponent,
        OfficeComponent,
        HeadboardComponent,
        OfficialsComponent,
        OrganizationChartComponent,
        AlcoholControlComponent,
        AlcoholControlDialogComponent,
        ListLotteryControlComponent,
        OrganizationChartSelectionComponent,
        TestTypeComponent,
        DetailsOfficialsComponent,
        TestTypeDialogComponent,
        DetailsOfficialsDialogComponent,
        ViewDocumentDialogComponent,
        OfficialDialogComponent,
        OfficialsPsychoactiveComponent,
        OfficialsPsychoactiveDialogComponent,
        AlcoholControlGanttComponent,
        ViewDocGenDialogComponent,
        TestQueryComponent,
        PermissionsComponent,
        ClassifiersComponent,
        PermissionsListComponent,
        PermissionsDetailsComponent,
        ClassifiersDialogComponent,
        TicketRequestComponent,
        OrganizationChartTicketComponent,
        OrganigramaComponent,
        OrganizationChartListComponent,
        OrganizationChartDetailsComponent,
        OrganizationChartDialogComponent,
        OrganizationChartItemComponent,
        OrganizationChartAllocationComponent,
        SummativeProcessesComponent,
        SummativeProcessesListComponent,
        SummativeProcessesDetailsComponent,
        ItemHistoryComponent,
        OrganizationChartItemDialogComponent,
        OrganizationChartItemDetailsComponent,
        FileManagerComponent,
        FileManagerListComponent,
        FileManagerDetailsComponent,
        FileManagerViewComponent,
        DocumentViewerComponent,
        ControlBudgetComponent,
        ControlBudgetListComponent,
        ControlBudgetDetailsComponent,
        OperationalBaseComponent,
        TestOrganizationComponent,
        ManualTestDialogComponent
    ],
    imports: [
        RouterModule.forChild(humanTalentRoutes),
        SharedModule,

        MatCheckboxModule,
        MatFormFieldModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        MatPaginatorModule,

        MatDatepickerModule,
        MatNativeDateModule,
        MatListModule,
        MatSelectModule,
        MatDialogModule,
        MatAutocompleteModule,

        MatTableExporterModule,

        BobyCardModule,

        DragDropModule,
        CdkTableModule,
        CdkTreeModule,
        MatTreeModule,
        MatBadgeModule,

        NgxDocViewerModule,
        InfiniteScrollModule,

        TreeModule,
        OrganizationChartModule,
        ToastModule,
        PanelModule,
        EditorModule,
        TreeTableModule,
        AutoCompleteModule,
        InputTextModule,
        MatChipsModule,
        MatProgressSpinnerModule
    ],
    providers: [
        MessageService,
        TreeDragDropService,
        { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
    ]
})
export class HumanTalentModule { }
