import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, switchMap, from } from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ApiErpService} from "../../../../core/api-erp/api-erp.service";


@Injectable({
  providedIn: 'root'
})
export class ReportsService {

    private _listaReclamo$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _listaRespuesta$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    constructor(private _apiErp:ApiErpService,private _httpClient: HttpClient) { }


    getGestion(): Observable<any>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };


        return from(this._apiErp.post('parametros/Gestion/listarGestion',{
            start:0,
            limit:50,
            sort:'gestion',
            dir:'desc'
        })).pipe(
            switchMap((response: any) => {
                // Return a new observable with the response
                return of(response.datos);
            })
        );

    }

    /**
     * Load oficina
     */
    searchOficina(query: string): Observable<any[]>
    {
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };
        return from(this._apiErp.post('reclamo/OficinaReclamo/listarOficina',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'ofi.nombre#ofi.codigo#lug.nombre',query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load report reclamos
     */
    getReclamo(params):Observable<{ pagination: any; reclamos: any[] }>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };


        return from(this._apiErp.post('reclamo/Cliente/libroReclamo',{
            id_oficina_registro_incidente:params.id_oficina,
            fecha_ini:`01/01/${params.gestion}`,
            fecha_fin:`31/12/${params.gestion}`,
            oficina: '',
            tipo: 'listado'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'nro_frd';
                const order = 'asc';
                const page = 0 ;
                const size = response.datos.length;
                // Clone the products
                let reclamos: any[] | null =  response.datos;
                // Sort clientes
                if ( sort === 'nro_frd' )
                {
                    reclamos.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    reclamos.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = reclamos.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // products but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    reclamos = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    reclamos = reclamos.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                // Return a new observable with the response
                this._listaReclamo$.next(reclamos);

                return of({reclamos,pagination});
            })
        );

    }

    /**
     * Load report respuestas
     */
    getRespuesta(params):Observable<{ pagination: any; respuestas: any[] }>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };


        return from(this._apiErp.post('reclamo/Reclamo/libroRespuesta',{
            id_oficina_registro_incidente:params.id_oficina,
            fecha_ini:`01/01/${params.gestion}`,
            fecha_fin:`31/12/${params.gestion}`,
            tipo: 'listado'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'correlativo';
                const order = 'asc';
                const page = 0 ;
                const size = response.datos.length;
                // Clone the products
                let respuestas: any[] | null =  response.datos;
                // Sort clientes
                if ( sort === 'correlativo' )
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

                // Paginate - Start
                const itemsLength = respuestas.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

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
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                // Return a new observable with the response
                this._listaRespuesta$.next(respuestas);

                return of({respuestas,pagination});
            })
        );
    }

    getPeriodo(id_gestion: number): Observable<any>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };

        return from(this._apiErp.post('parametros/Periodo/listarPeriodo',{
            start:0,
            limit:50,
            id_gestion:id_gestion
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    getResumen(params: any): Observable<any>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };

        return from(this._apiErp.post('reclamo/Reclamo/getResumen',{
            fecha_ini: params.fecha_ini,
            fecha_fin: params.fecha_fin
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].jsondata));
            })
        );
    }

    getDetalleResumen(params: any): Observable<any>{

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            })
        };

        return from(this._httpClient.post('api/apps/claims-management/getSummaryDetail',{
            fecha_ini: params.fecha_ini,
            fecha_fin: params.fecha_fin
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].jsondata));
            })
        );
    }
}
