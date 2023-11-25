import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { catchError, Observable, throwError } from 'rxjs';
import { ClaimsService } from "./claims.service";

@Injectable({
    providedIn: 'root'
})
export class AnswersResolver implements Resolve<any>
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
export class AnswerResolver implements Resolve<any>
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._claimS.getAnswerById(route.paramMap.get('id'))
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
