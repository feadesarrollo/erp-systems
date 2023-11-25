import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _adminService: PermissionsService )
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
        return this._adminService.getRoles();
    }
}

@Injectable({
    providedIn: 'root'
})
export class PermissionResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _adminService: PermissionsService,
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
        return this._adminService.getRoleById(route.paramMap.get('id'))
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
