import {Injectable} from "@angular/core";
import { catchError, Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { SettingsService } from "../settings.service";


@Injectable({
    providedIn: 'root'
})
export class CustomersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _settingsService: SettingsService, )
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<{ pagination: any; customers: any[] }>
    {
        return this._settingsService.getCliente(0,10);
    }
}

@Injectable({
    providedIn: 'root'
})
export class CustomerResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _settingsService: SettingsService,
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
        return this._settingsService.getCustomerById(route.paramMap.get('id'))
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
