import { Injectable } from '@angular/core';
import {tap} from "rxjs/operators";
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClaimRipatService {

    private _claims: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient
    ) { }

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
    get claim$(): Observable<any>
    {
        return this._claims.asObservable();
    }

    /**
     * Get ripat claims
     */
    getRipatClaims(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/claims-management/getRipatClaims',{params: {id_gestion:22,start:0,limit:7000000,sort:'fecha_limite_respuesta', dir:'asc'}}).pipe(
            tap((items: any) => {
                this._pagination.next(items.pagination);
                this._claims.next(items.claims);
            })
        );
    }

}
