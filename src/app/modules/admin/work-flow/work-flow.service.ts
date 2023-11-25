import { Injectable } from '@angular/core';
import { switchMap } from "rxjs/operators";
import { ApiErpService } from "../../../core/api-erp/api-erp.service";
import { HttpClient } from "@angular/common/http";
import { Observable, from, of } from "rxjs";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WorkFlowService {
    private _process: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Getter for permission
     */
    get process$(): Observable<any>
    {
        return this._process.asObservable();
    }

    getListProcess(): Observable<any>{
        return from(this._apiErp.post('workflow/ProcesoMacro/listarProcesoMacro',{
            start:0,
            limit:1000000,
            sort:'nombre',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {
                this._process.next(response.datos)
                return of(response.datos);
            })
        );
    }
}
