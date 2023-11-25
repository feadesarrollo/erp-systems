import { Route } from '@angular/router';
import { EntityComponent } from "./entity/entity.component";
import {AtoCategoriesComponent} from "./ato-categories/ato-categories.component";
import {RateLandingComponent} from "./rate-landing/rate-landing.component";
import {AircraftWeightComponent} from "./aircraft-weight/aircraft-weight.component";
import {RateSurchargesComponent} from "./rate-surcharges/rate-surcharges.component";
import {RateParkingComponent} from "./rate-parking/rate-parking.component";
import {LandingFeeComponent} from "../landing-parking/landing-fee/landing-fee.component";

export const parametricsRoutes: Route[] = [
    {
        path:'entity',
        component: EntityComponent
    },
    {
        path:'atocategories',
        component: AtoCategoriesComponent
    },
    {
        path:'aircraftweight',
        component: AircraftWeightComponent
    },
    {
        path:'ratelanding',
        component: RateLandingComponent
    },
    {
        path:'ratesurcharges',
        component: RateSurchargesComponent
    },
    {
        path:'rateparking',
        component: RateParkingComponent
    },
    {
        path: 'landing-fee',
        component: LandingFeeComponent
    }
];
