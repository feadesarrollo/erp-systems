import { Injectable } from '@angular/core';
import {switchMap} from "rxjs/operators";
import { BehaviorSubject, of, Observable, throwError, from } from "rxjs";
import {ApiErpService} from "../../../../../../core/api-erp/api-erp.service";
import {HttpClient} from "@angular/common/http";
@Injectable({
    providedIn: 'root'
})
export class OrganizationChartItemService {

    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Create summative
     */
    createItem(): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SummativeProcess/getSummativeId', {})).pipe(
            switchMap((resp: any) => {
                const newSummative = {
                    id_summative_process: +resp.data.id_summative_process,
                    id_funcionario: '',
                    start_date: '',
                    end_date: '',
                    summative_reason: ''
                };

                // Update the roles with the new role
                //this._summatives.next([newSummative, ...this._summatives.getValue()]);
                // Return the new customer
                return of(newSummative);
            })
        );

    }
}
