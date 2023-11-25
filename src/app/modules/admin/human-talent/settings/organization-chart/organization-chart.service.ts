import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable, throwError, from } from "rxjs";
import { take, map, tap, filter,  } from "rxjs/operators";
import {ApiErpService} from "../../../../../core/api-erp/api-erp.service";
import {HttpClient} from "@angular/common/http";
@Injectable({
  providedIn: 'root'
})
export class OrganizationChartService {

    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) {}

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

    getItems(id_uo, start, limit):Observable<{ pagination: any; items: any[] }>{

        return from(this._httpClient.get<{ pagination: any; items: any[] }>('api/apps/human-talent/getItems', {params: {id_uo, start,limit}})).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._items.next(response.items);
            })
        );
    }
}
