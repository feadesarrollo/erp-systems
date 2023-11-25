import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, of, map, from } from "rxjs";
import {catchError, switchMap, take} from "rxjs/operators";
import {ApiErpService} from "../../../../../../core/api-erp/api-erp.service";

@Injectable({
  providedIn: 'root'
})
export class ClaimAnswerService {

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject({});
    private _respuestas: BehaviorSubject<any[] | null> = new BehaviorSubject([]);

    constructor(private _httpClient: HttpClient,private _apiErp:ApiErpService) { }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }


    /**
     * Getter for archivos
     */
    get respuestas$(): Observable<any[]>
    {
        return this._respuestas.asObservable();
    }

    /**
     * Get archivos
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getRespuestas(p_page: number = 0, p_size: number = 10, p_sort: string = 'nro_respuesta', p_order: 'asc' | 'desc' | '' = 'asc', p_search:string, reclamo: any = null, tipo_interfaz: string):
        Observable<{ pagination: any; respuestas: any[] }>
    {
        /*const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };*/

        return from(this._apiErp.post('reclamo/Respuesta/listarRespuesta',{
            start:0,
            limit:50,
            sort:'id_respuesta',
            dir:'desc',
            id_reclamo:reclamo.id_reclamo,
            tipo_interfaz
        })).pipe(
            switchMap((resp: any) => {
                // Get available queries
                const search = p_search;
                const sort = p_sort;
                const order = p_order;
                const page = p_page ;
                const size = p_size;

                // Clone the products
                let respuestas: any[] | null = resp.datos;

                // Sort the products
                if ( p_sort === 'nro_respuesta' )
                {
                    respuestas.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    respuestas.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // If search exists...
                if ( search )
                {
                    // Filter the products
                    respuestas = respuestas.filter(respuesta => respuesta.nro_respuesta && respuesta.nro_respuesta.toLowerCase().includes(search.toLowerCase()));
                }

                // Paginate - Start
                const productsLength = respuestas.length;

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
                    respuestas = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    respuestas = respuestas.slice(begin, end);

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
                this._respuestas.next(respuestas);
                return of({respuestas,pagination});
            })
        );


    }

    /**
     * Save Respuesta
     */
    createRespuesta(respuesta: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Respuesta/insertarRespuesta', respuesta)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError((error)=>{
                return of(error);
            })
        );

    }

    /**
     * Delete respuesta
     */
    deleteRespuesta(respuesta: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Respuesta/eliminarRespuesta', {id_respuesta: respuesta.id_respuesta})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Load Cliente
     */
    searchTemplateAnswer(query: string): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/Respuesta/listarRespuesta',
            {start:0,limit:50,sort:'nro_cite',dir:'asc',par_filtro:'res.respuesta#res.nro_cite#vc.nombre_completo2',query:query,tipo_interfaz:'RespuestaDetalle'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /********************************************** TEMPLATE **********************************************/
    /**
     * filter By Query Template
     */
    filterByQueryTemplate(category,query, id_tipo_incidente): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Reclamo/getTemplateList',{category, query, id_tipo_incidente, par_filtro:'tt.content'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );

    }

    /********************************************** TEMPLATE **********************************************/

    /**
     * GET validate cite number
     */
    validateCiteNumber(params): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Respuesta/getCite',params)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.data);
            }),
            catchError( (error) => {
                return of(error)
            })
        );

    }

}
