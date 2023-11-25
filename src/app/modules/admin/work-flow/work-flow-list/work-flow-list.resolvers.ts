import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import { Observable } from 'rxjs';
import {WorkFlowService} from "../work-flow.service";

@Injectable({
    providedIn: 'root'
})
export class WorkFlowListResolvers implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor( private _workService:  WorkFlowService)
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
        return this._workService.getListProcess();
    }
}
