import { Injectable } from '@angular/core';
import { catchError, switchMap } from "rxjs/operators";
import { ApiErpService } from "../../../../../core/api-erp/api-erp.service";
import { Observable, from, of } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class TicketRequestService {

    constructor(
        private _apiErp:ApiErpService
    ) { }


    /**
     * PUT checked selection
     */
    checkedSelection (id, expandable, checked): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SolicitudTicket/checkedSelection', {
            id,
            expandable,
            checked
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    /**
     * GET Selected Organization
     */
    getSelectedOrganizationChart(): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/SolicitudTicket/getSelectedOrganizationChart',
            {}
        )).pipe(
            switchMap((response: any) => {
                return of(JSON.parse(response.datos[0].jsondata));
            })
        );

    }
}
