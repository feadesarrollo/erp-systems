import { Route } from '@angular/router';
import {LandingDataComponent} from "./landing-data/landing-data.component";
import {ParkingDataComponent} from "./parking-data/parking-data.component";
import {ClosingDialogComponent} from "./landing-data/closing-dialog/closing-dialog.component";

export const landingRoutes: Route[] = [
    {
        path: 'landing-data',
        component: LandingDataComponent,
        children: [
            {
                path: 'closing',
                component: ClosingDialogComponent
            }
        ]
    },
    {
        path: 'parking-data',
        component: ParkingDataComponent
    }
];
