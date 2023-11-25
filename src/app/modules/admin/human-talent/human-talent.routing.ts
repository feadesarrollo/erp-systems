import { Route } from '@angular/router';
import { HumanTalentMenuComponent } from './human-talent-menu/human-talent-menu.component';
import { OfficeComponent } from './settings/office/office.component';
import { OfficialsComponent } from './processes/officials/officials.component';
import { HumanTalentComponent } from "./human-talent.component";
import { OrganizationChartComponent } from "./settings/organization-chart/organization-chart.component";
import { AlcoholControlComponent } from "./processes/alcohol-control/alcohol-control.component";
import { ListLotteryControlComponent } from "./processes/alcohol-control/list-lottery-control/list-lottery-control.component";
import { OrganizationChartSelectionComponent } from "./processes/alcohol-control/organization-chart-selection/organization-chart-selection.component";
import { TestTypeComponent } from "./processes/alcohol-control/test-type/test-type.component";
import { DetailsOfficialsComponent } from "./processes/alcohol-control/details-officials/details-officials.component";
import { OfficialsPsychoactiveComponent } from "./processes/officials/officials-psychoactive/officials-psychoactive.component";
import { TestQueryComponent } from "./processes/alcohol-control/test-query/test-query.component";
import { PermissionsComponent } from "./permissions/permissions.component";
import { PermissionsListComponent } from "./permissions/permissions-list/permissions-list.component";
import { PermissionsDetailsComponent } from "./permissions/permissions-details/permissions-details.component";
import { ClassifiersComponent } from "./classifiers/classifiers.component";
import { PermissionResolver, PermissionsResolver } from "./permissions/permissions.resolvers";
import { CanDeactivatePermissionsDetails } from './permissions/permissions.guards';
import {OrganizationChartResolver, OrganizationChartsResolver, RoleResolver} from './human-talent.resolvers';
import { OrganizationChartTicketComponent } from "./processes/ticket-request/organization-chart-ticket/organization-chart-ticket.component";
import {OrganigramaComponent} from "./processes/organigrama/organigrama.component";
import {OrganizationChartListComponent} from "./settings/organization-chart/organization-chart-list/organization-chart-list.component";
import {OrganizationChartDetailsComponent} from "./settings/organization-chart/organization-chart-details/organization-chart-details.component";
import {CanDeactivateOrganizationChartsDetails} from "./settings/organization-chart/organization-chart.guards";
import {SummativeProcessesComponent} from "./processes/ticket-request/summative-processes/summative-processes.component";
import {SummativeProcessesListComponent} from "./processes/ticket-request/summative-processes/summative-processes-list/summative-processes-list.component";
import {SummativeProcessesDetailsComponent} from "./processes/ticket-request/summative-processes/summative-processes-details/summative-processes-details.component";
import {
    SummativeResolver,
    SummativesResolver
} from "./processes/ticket-request/summative-processes/summative-process.resolvers";
import {CanDeactivateSummativesDetails} from "./processes/ticket-request/summative-processes/summative-process.guards";
import {OrganizationComponent} from "./settings/organization/organization.component";
import {OrgChartComponent} from "./org-chart/org-chart.component";
import {OrganizationChartDialogComponent} from "./settings/organization-chart/organization-chart-dialog/organization-chart-dialog.component";

export const humanTalentRoutes: Route[] = [
    {
        path: 'modules',
        component: HumanTalentComponent,
        children: [
            {
                path: '',
                component: HumanTalentMenuComponent,
                resolve: {
                    roles: RoleResolver
                }
            },
            {
                path: 'settings/office',
                component: OfficeComponent/*,
                resolve: {
                    offices: OfficeResolvers
                }*/
                /*children: [
                    {
                        path: ':id',
                        component: OfficialsComponent,
                        resolve: {
                            officials: OfficialResolvers
                        }
                    }
                ]*/
            },

            {
                path: 'settings/office/:id',
                component: OfficialsComponent/*,
                resolve: {
                    officials: OfficialResolvers
                }*/
            },
            {
                path: 'processes/officials',
                component: OfficialsComponent
            },
            {
                path: 'processes/officials/:id/official-psychoactive',
                component: OfficialsPsychoactiveComponent
            },

            /*{
                path: 'settings/organization',
                component: OrganizationChartComponent
            },*/

            {
                path: 'settings/organization-chart',
                component: OrganizationComponent
            },
            {
                path: 'settings/organization',
                component: OrganizationChartComponent,
                children : [
                    {
                        path     : '',
                        component: OrganizationChartListComponent,
                        resolve: {
                            customers: OrganizationChartsResolver
                        },
                        children : [
                            {
                                path         : ':id',
                                component    : OrganizationChartDetailsComponent,
                                children:  [
                                    {
                                        path         : 'details',
                                        component    : OrganizationChartDialogComponent,
                                    }
                                ],
                                resolve: {
                                    customer: OrganizationChartResolver
                                },
                                canDeactivate: [CanDeactivateOrganizationChartsDetails]
                            }
                        ]
                    }
                ]
            },

            {
                path: 'processes/psychoactive-program',
                component: AlcoholControlComponent
            },
            {
                path: 'processes/psychoactive-program/organization-chart-selection',
                component: OrganizationChartSelectionComponent
            },
            {
                path: 'processes/psychoactive-program/test-type',
                component: TestTypeComponent
            },
            {
                path: 'processes/psychoactive-program/test-query',
                component: TestQueryComponent
            },
            {
                path: 'processes/psychoactive-program/:id',
                component: ListLotteryControlComponent
            },
            {
                path: 'processes/psychoactive-program/:id/details-officials/:id',
                component: DetailsOfficialsComponent
            },

            {
                path: 'processes/ticket-request/organization-chart-ticket',
                component: OrganizationChartTicketComponent
            },
            /*{
                path: 'processes/ticket-request/summative-processes',
                component: SummativeProcessesComponent
            },*/

            {
                path: 'processes/ticket-request/summative-processes',
                component: SummativeProcessesComponent,
                children : [
                    {
                        path     : '',
                        component: SummativeProcessesListComponent,
                        resolve: {
                            customers: SummativesResolver
                        },
                        children : [
                            {
                                path         : ':id',
                                component    : SummativeProcessesDetailsComponent,
                                resolve: {
                                    customer: SummativeResolver
                                },
                                canDeactivate: [CanDeactivateSummativesDetails]
                            }
                        ]
                    }
                ]
            },

            {
                path: 'settings/orga-chart',
                component: OrganigramaComponent
            },
        ]
    },
    {
        path: 'permission',
        component: PermissionsComponent,
        children : [
            {
                path     : '',
                component: PermissionsListComponent,
                resolve  : {
                    permissions : PermissionsResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : PermissionsDetailsComponent,
                        resolve      : {
                            permission  : PermissionResolver
                        },
                        canDeactivate: [CanDeactivatePermissionsDetails]
                    }
                ]
            }
        ]
    },
    {
        path: 'classifiers',
        component: ClassifiersComponent
    }
];
