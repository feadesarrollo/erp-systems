import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap, take, map, from } from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ApiErpService} from "../../../../../../core/api-erp/api-erp.service";


@Injectable({
  providedIn: 'root'
})
export class ClaimReportService {

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject({});
    private _informes: BehaviorSubject<any[] | null> = new BehaviorSubject([]);

    constructor(private _apiErp:ApiErpService) { }


    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }


    /**
     * Getter for informes
     */
    get informes$(): Observable<any[]>
    {
        return this._informes.asObservable();
    }

    /**
     * Get informes
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getInformes(p_page: number = 0, p_size: number = 10, p_sort: string = 'nombre_tipo_documento', p_order: 'asc' | 'desc' | '' = 'asc', p_search:string, reclamo: any = null):
        Observable<{ pagination: any; informes: any[] }>
    {
        return from(this._apiErp.post('reclamo/Informe/listarInforme',{
            start:0,
            limit:50,
            sort:'id_informe',
            dir:'desc',
            id_reclamo:reclamo.id_reclamo
        })).pipe(
            switchMap((resp: any) => {
                // Get available queries
                const search = p_search;
                const sort = p_sort;
                const order = p_order;
                const page = p_page ;
                const size = p_size;

                // Clone the products
                let informes: any[] | null = resp.datos;

                // Sort the products
                if ( p_sort === 'desc_fun' )
                {
                    informes.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    informes.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // If search exists...
                if ( search )
                {
                    // Filter the products
                    informes = informes.filter(informe => informe.desc_fun && informe.desc_fun.toLowerCase().includes(search.toLowerCase()));
                }

                // Paginate - Start
                const productsLength = informes.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), productsLength);
                const lastPage = Math.max(Math.ceil(productsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // products but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    informes = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    informes = informes.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : productsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }
                this._pagination.next(pagination);
                this._informes.next(informes);
                return of({informes,pagination});
            })
        );


    }

    /**
     * Save Informe
     */
    createInforme(informe: any): Observable<any>
    {

        /*return this.informes$.pipe(
            take(1),
            switchMap(informes => from(this._apiErp.post('reclamo/Informe/insertarInforme', informe )).pipe(
                map( (resp:any) => {
                    this._informes.next([informe, ...informes]);
                    // Return a new observable with the response
                    return this._informes;
                })
            ))
        );*/

        return from(this._apiErp.post('reclamo/Informe/insertarInforme', informe)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete report
     */
    deleteInforme(informe: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Informe/eliminarInforme', {id_informe: informe.id_informe})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
}
