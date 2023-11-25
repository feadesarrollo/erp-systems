import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Claim } from './claims.types';
import { ClaimsService } from '../claims/claims.service';



@Injectable({
    providedIn: 'root'
})
export class ClaimsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _rolesService: ClaimsService )
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
        return this._rolesService.getRoles();
    }
}

@Injectable({
    providedIn: 'root'
})

export class ClaimResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _claimS: ClaimsService
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Claim>
    {
        return this._claimS.getReclamoById(route.paramMap.get('id'))
            .pipe(
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
