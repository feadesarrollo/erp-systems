import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, from, switchMap } from "rxjs";
import {ApiErpService} from "app/core/api-erp/api-erp.service";
import {BobyMockApiUtils} from "@boby/lib/mock-api";
@Injectable({
  providedIn: 'root'
})
export class ClaimGanttService {

    constructor(private _httpClient: HttpClient, private _apiErp:ApiErpService) { }

    getProcessByPage(pageNumber: number, id_proceso_wf: number): Observable<any[]>{
        return from(this._httpClient.post('api/apps/claims-management/listGanttStructure',{
            start:pageNumber,
            limit:5,
            id_proceso_wf:id_proceso_wf
        })).pipe(
            switchMap((resp: any) => {
                return of(resp.datos);
            })
        );
    }

    /**
     * Upload archivo al server
     */
    onUploadFile(id_estado_wf: any, archivo: File, imageSrc: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Reclamo/onUploadFile',{
            id_estado_wf: id_estado_wf,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1].length > 7 ? archivo.type.split('/')[1] : archivo.name.split('.')[1],
            fileName: BobyMockApiUtils.guid(),
            name: archivo.name
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.data);
            })
        );
    }
}
