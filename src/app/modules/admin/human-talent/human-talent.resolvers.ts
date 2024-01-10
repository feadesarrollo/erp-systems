import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { HumanTalentService } from './human-talent.service';
import { catchError, Observable, throwError, of } from 'rxjs';
import { switchMap } from "rxjs/operators";
import { PermissionsService } from "./permissions/permissions.service";
import {OrganizationChartService} from "./settings/organization-chart/organization-chart.service";

@Injectable({
    providedIn: 'root'
})

export class OfficialResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _HTService: HumanTalentService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._HTService.getOfficialsByOffice(route.paramMap.get('id'))
            .pipe(
                switchMap(
                    (resp:any)=>{
                        return of(resp);
                    }
                ),
                // Error here means the requested task is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})

export class OfficeResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _HTService: HumanTalentService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._HTService.getOffices()
            .pipe(
                switchMap(
                    (resp:any)=>{
                        return of(resp);
                    }
                ),
                // Error here means the requested task is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }


}

@Injectable({
    providedIn: 'root'
})
export class RoleResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _roleService:  PermissionsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]>
    {
        return this._roleService.getRolesByOfficial();
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrganizationChartsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _humanTalentService:  HumanTalentService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<any>
    {
        return this._humanTalentService.orgaChartData$;
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrganizationChartResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _humanTalentService:  HumanTalentService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._humanTalentService.getNodeMapItem(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested contact is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class ItemsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _organizationService:  OrganizationChartService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        console.warn('route',route);
        return this._organizationService.getItems(route.paramMap.get('id'),0,7,'codigo','asc','');
    }
}

@Injectable({
    providedIn: 'root'
})
export class ItemDetailResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _organizationService:  OrganizationChartService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._organizationService.getItemById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested contact is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    console.error('parentUrl',parentUrl);
                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

