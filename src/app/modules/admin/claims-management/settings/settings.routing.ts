import { Route } from '@angular/router';
import {CustomerComponent} from "./customer/customer.component";
import {CompensationComponent} from "./compensation/compensation.component";
import {CancellationReasonComponent} from "./cancellation-reason/cancellation-reason.component";
import {HalfClaimComponent} from "./half-claim/half-claim.component";
import {HolidayComponent} from "./holiday/holiday.component";
import {IncidentTypeComponent} from "./incident-type/incident-type.component";
import {OfficeComponent} from "./office/office.component";
import { CustomerDetailsComponent } from "./customer/customer-details/customer-details.component";
import {CustomerListComponent} from "./customer/customer-list/customer-list.component";
import { CanDeactivateCustomersDetails } from "../settings/customer/customer.guards";
import {CustomerResolver, CustomersResolver} from "./customer/customer.resolvers";

export const settingsRoutes: Route[] = [
    {
        path: 'cancellation-reason',
        component: CancellationReasonComponent
    }
    ,
    {
        path: 'compensation',
        component: CompensationComponent
    },
    {
        path: 'customer',
        component: CustomerComponent,
        children : [
            {
                path     : '',
                component: CustomerListComponent,
                resolve: {
                  customers: CustomersResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : CustomerDetailsComponent,
                        resolve: {
                            customer: CustomerResolver
                        },
                        canDeactivate: [CanDeactivateCustomersDetails]
                    }
                ]
            }
        ]
    },
    {
        path: 'half-claim',
        component: HalfClaimComponent
    },
    {
        path: 'holiday',
        component: HolidayComponent
    },
    {
        path: 'incident-type',
        component: IncidentTypeComponent
    },
    {
        path: 'office',
        component: OfficeComponent
    }
];
