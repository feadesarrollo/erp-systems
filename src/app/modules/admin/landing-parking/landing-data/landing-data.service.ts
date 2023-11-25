import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable, throwError, from } from "rxjs";
import {take, map, tap, filter, switchMap,} from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import {BobyMockApiUtils} from "../../../../../@boby/lib/mock-api";
import {ApiErpService} from "../../../../core/api-erp/api-erp.service";
@Injectable({
  providedIn: 'root'
})
export class LandingDataService {

    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject({});
    private _closing: BehaviorSubject<any | null> = new BehaviorSubject({});
    constructor(
        private _httpClient: HttpClient,
        private _apiErp:ApiErpService
    ) { }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for items
     */
    get items$(): Observable<any[]>
    {
        return this._items.asObservable();
    }

    /**
     * Getter for items
     */
    get closing$(): Observable<any[]>
    {
        return this._closing.asObservable();
    }

    /**
     * Get conciliation closing
     */
    getConciliationClosing(list,startDate,endDate,airport,aircraft): Observable<{ pagination: any; items: any[]; djson: any }>{
        return from(this._httpClient.get<{ pagination: any; items: any[]; djson: any }>(
            'api/apps/landing-data/getConciliationClosing',
            {params: {list:JSON.stringify(list),startDate,endDate,airport,aircraft}})
        ).pipe(
            tap((response: any) => {
                this._pagination.next(response.pagination);
                this._items.next(response.items);
                this._closing.next(response.djson);
            })
        );
        /*return from(this._httpClient.post<{ pagination: any; items: any[] }>(
            'api/apps/landing-data/getConciliationClosing',
            {list,startDate,endDate,ato,aircraft}
        )).pipe(
            tap((response: any) => {
                this._pagination.next(response.pagination);
                this._items.next(response.items);
            })
        );*/
    }

    /**
     * Upload file to server
     */
    onUploadFile(id_landing, idLandingClosing: any, archivo: File, imageSrc: any): Observable<any>
    {
        return from(this._apiErp.post('contabilidad/Landing/onUploadFile',{
            id_landing,
            idLandingClosing,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1].length > 7 ? archivo.type.split('/')[1] : archivo.name.split('.')[1],
            fileName: BobyMockApiUtils.guid(),
            name: archivo.name
        })).pipe(
            switchMap((resp: any) => {
                const djson = JSON.parse(resp.data.djson);
                this._closing.next(djson);
                // Return a new observable with the response
                return of(resp.data);
            })
        );
    }
}
