import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot} from "@angular/router";
import { catchError, Observable, throwError } from 'rxjs';
import {ControlBudgetService} from "./control-budget.service";

@Injectable({
    providedIn: 'root'
})
export class BudgetsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _budgetService: ControlBudgetService )
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<{ pagination: any; summatives: any[] }>
    {
        return this._budgetService.getControlBudget(10113,'base');
    }
}

@Injectable({
    providedIn: 'root'
})
export class BudgetResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _budgetService: ControlBudgetService,
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
        return this._budgetService.getBudgetById(route.paramMap.get('id'))
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
