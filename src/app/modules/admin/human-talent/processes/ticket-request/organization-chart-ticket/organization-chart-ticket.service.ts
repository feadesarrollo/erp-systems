import { Injectable } from '@angular/core';
import {tap} from "rxjs/operators";
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OrganizationChartTicketService {

    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get item$(): Observable<any>
    {
        return this._items.asObservable();
    }

    /**
     * Get Update History
     */
    getUpdateHistory(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/human-talent/getUpdateHistory',{params: {start:0,limit:7000000,sort:'usuario', dir:'asc'}}).pipe(
            tap((items: any) => {
                this._pagination.next(items.pagination);
                this._items.next(items.items);
            })
        );
    }
}
