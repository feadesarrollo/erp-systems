import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, from, take, map, tap, filter, throwError } from "rxjs";
import { ApiErpService } from '../../../../core/api-erp/api-erp.service';
import {catchError, switchMap} from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { BobyMockApiUtils } from '@boby/lib/mock-api';
import { assign, cloneDeep } from 'lodash-es';
import {Validators} from "@angular/forms";


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    private _cliente$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _customer: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _statusCustomer: BehaviorSubject<any | null> = new BehaviorSubject('');

    private _compensacion$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _feriado$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tipoIncidente$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _medioReclamo$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _motivoAnulacion$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _oficina$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    constructor(private _apiErp:ApiErpService, private _httpClient: HttpClient) { }

    getCliente(start, limit):Observable<{ pagination: any; customers: any[] }>{

        /*return from(this._httpClient.get<any[]>('api/apps/claims-management/listCustomers',{params: {start, limit}})).pipe(
            switchMap((response: any) => {
                this._cliente$.next(response.datos);
                return of(response);
            })
        );*/

        return from(this._httpClient.get<{ pagination: any; customers: any[] }>('api/apps/claims-management/listCustomers', {params: {start,limit}})).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._customers.next(response.customers);
            })
        );
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for products
     */
    get customers$(): Observable<any[]>
    {
        return this._customers.asObservable();
    }

    /**
     * Getter for contact
     */
    get customer$(): Observable<any>
    {
        return this._customer.asObservable();
    }

    /**
     * Getter for summative
     */
    get statusCustomer$(): Observable<any>
    {
        return this._statusCustomer.asObservable();
    }

    /**
     * Getter for summative
     */
    set statusCustomer(value)
    {
        this._statusCustomer.next(value);
    }

    /**
     * Create customer
     */
    createCustomer(): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Reclamo/getCustomerId', {})).pipe(
            switchMap((resp: any) => {
                const newCustomer = {
                    id_cliente: resp.data.id_cliente,
                    nombre: '',
                    apellido_paterno: '',
                    apellido_materno: '',
                    genero: '',
                    ci: '',
                    lugar_expedicion: '',
                    nacionalidad: '',
                    celular: '',
                    telefono: '',
                    email: '',
                    email2: '',
                    direccion: '',
                    id_pais_residencia: '',
                    ciudad_residencia: '',
                    barrio_zona: ''
                };

                // Update the roles with the new role
                this._customers.next([newCustomer, ...this._customers.getValue()]);
                // Return the new customer
                return of(newCustomer);
            })
        );

    }


    getCliente2(start, limit):Observable<{ pagination: any; clientes: any[] }>{


        return from(this._apiErp.post(
            'reclamo/Cliente/listarCliente',
            {
                start:0,
                limit:100000000,
                sort:'id_cliente',
                dir:'desc'
            }
        )).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'id_cliente';
                const order = 'desc';
                const page = 0 ;
                const size = response.total;
                // Clone the products
                let clientes: any[] | null =  response.datos;

                // Sort clientes
                if ( sort === 'id_cliente' )
                {
                    clientes.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    clientes.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = response.total;//clientes.length;

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
                    clientes = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    clientes = clientes.slice(begin, end);

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
                /*this._pagination.next(pagination);
                this._motivoAnulacion.next(response.datos);*/

                // Return a new observable with the response
                this._cliente$.next(response.datos);

                return of({clientes,pagination});
            })
        );
    }

    /**
     * filter By Query
     */
    filterByQuery(start, limit, query): Observable<any[]>
    {

        /*return from(this._apiErp.post('reclamo/Cliente/listarCliente',{start, limit, query, par_filtro:'c.nombre_completo1#c.nombre_completo2#lug.nombre#cli.nacionalidad#cli.email#cli.ci#cli.genero'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );*/
        return from(this._apiErp.post('reclamo/Cliente/listarCliente',{start, limit, query, par_filtro:'c.nombre_completo1#c.nombre_completo2#lug.nombre#cli.nacionalidad#cli.email#cli.ci#cli.genero'})).pipe(
            tap((response: any) => {

                const page = parseInt(start ?? '0', 10);
                const size = parseInt(limit ?? '10', 10);
                // Clone the products
                let customers: any[] | null = response.datos;

                // Paginate - Start
                const customersLength = response.total;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), customersLength);
                const lastPage = Math.max(Math.ceil(customersLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // products but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage ) {
                    customers = null;
                    pagination = {
                        lastPage
                    };
                } else {
                    // Paginate the results by size
                    customers = customers.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : customersLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                // Return a success code along with some data
                this._pagination.next(pagination);
                this._customers.next(customers);

                // Return a new observable with the response
                //return of(response);
            })
        );

    }

    /**
     * search cliente
     * @param search
     */
    searchCliente(p_search = ''):Observable<{ pagination: any; clientes: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'id_cliente';
        const order = 'asc';
        const page = 0 ;
        const size = 1000000;
        // Clone the products
        let clientes: any[] | null = this._cliente$.getValue();

        // Sort the products
        if ( sort === 'id_cliente' )
        {
            clientes.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            clientes.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            clientes = clientes.filter(cust =>
                cust.nombre_completo2.toLowerCase().includes(search.toLowerCase())
                || cust.nombre_completo1.toLowerCase().includes(search.toLowerCase())
                || cust.genero.toLowerCase().includes(search.toLowerCase())
                || cust.ci?.toLowerCase().includes(search.toLowerCase())
                || cust.email?.toLowerCase().includes(search.toLowerCase())
                || cust.email2?.toLowerCase().includes(search.toLowerCase())
                || cust.celular?.toLowerCase().includes(search.toLowerCase())
                || cust.telefono?.toLowerCase().includes(search.toLowerCase())
                || cust.ciudad_residencia?.toLowerCase().includes(search.toLowerCase())
                || cust.nacionalidad?.toLowerCase().includes(search.toLowerCase())
                || cust.barrio_zona?.toLowerCase().includes(search.toLowerCase())
                || cust.pais_residencia?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = clientes.length;

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
            clientes = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            clientes = clientes.slice(begin, end);

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

        return of({clientes,pagination});
    }

    /**
     * Load Lugar
     */
    searchLugar(query: string, tipo:string): Observable<any[]>
    {


        if (tipo == 'expedicion') {
            return from(this._apiErp.post('parametros/Lugar/listarLugar', {
                start: 0,
                limit: 50,
                sort: 'nombre',
                dir: 'ASC',
                par_filtro: 'lug.nombre',
                es_regional: 'si',
                query: query
            })).pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    return of(resp.datos);
                })
            );
        }else{
            return from(this._apiErp.post('parametros/Lugar/listarLugar', {
                start: 0,
                limit: 50,
                sort: 'nombre',
                dir: 'ASC',
                par_filtro: 'lug.nombre',
                tipo: 'pais',
                query: query
            })).pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    return of(resp.datos);
                })
            );
        }
    }

    /**
     * Post cliente
     */
    postCliente(cliente: any): Observable<any>
    {

        if ( localStorage.getItem('status') == null ){
            return from(this._apiErp.post('reclamo/Cliente/insertarCliente', cliente)).pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    return of(resp);
                })
            );
        }else {
            const id = cliente.id_cliente;
            return this.customers$.pipe(
                take(1),
                switchMap(customers => this._httpClient.post('api/apps/claims-management/postCliente', cliente).pipe(
                    map((updatedRole) => {
                        // Find the index of the updated contact
                        const index = customers.findIndex(item => item.id_cliente === id);
                        // Update the contact
                        customers[index] = cliente;

                        // Update the contacts
                        this._customers.next(customers);

                        // Return the updated contact
                        return cliente;
                    }),
                    switchMap(updatedCostumer => this.customer$.pipe(
                        take(1),
                        filter(item => item && item.id_cliente === id),
                        tap(() => {

                            // Update the contact if it's selected
                            this._customer.next(updatedCostumer);

                            // Return the updated contact
                            return updatedCostumer;
                        })
                    ))
                ))
            );
        }
    }

    /**
     * DELETE cliente
     */
    deleteCliente(id_cliente: string): Observable<any>
    {

        return from(this._apiErp.post('reclamo/Cliente/eliminarCliente',{id_cliente})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );
    }

    /********************************* COMPENSATION *********************************/
    getCompensacion():Observable<{ pagination: any; compensaciones: any[] }>{

        return from(this._apiErp.post('reclamo/Compensacion/listarCompensacion',{
            start:0,
            limit:100000000,
            sort:'orden',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'orden';
                const order = 'asc';
                const page = 0 ;
                const size = 50;
                // Clone the products
                let compensaciones: any[] | null =  response.datos;

                // Sort the products
                if ( sort === 'orden' )
                {
                    compensaciones.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    compensaciones.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = compensaciones.length;

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
                    compensaciones = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    compensaciones = compensaciones.slice(begin, end);

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
                this._compensacion$.next(response.datos);

                return of({compensaciones,pagination});
            })
        );
    }

    /**
     * search compensacion
     * @param search
     */
    searchCompensacion(p_search = ''):Observable<{ pagination: any; compensaciones: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'orden';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the products
        let compensaciones: any[] | null = this._compensacion$.getValue();

        // Sort the products
        if ( sort === 'orden' )
        {
            compensaciones.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            compensaciones.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            compensaciones = compensaciones.filter(compen => compen.orden.toLowerCase().includes(search.toLowerCase())
                || compen.codigo.toLowerCase().includes(search.toLowerCase())
                || compen.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = compensaciones.length;

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
            compensaciones = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            compensaciones = compensaciones.slice(begin, end);

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

        return of({compensaciones,pagination});
    }

    /**
     * Post compensacion
     */
    postCompensacion(compen: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Compensacion/insertarCompensacion', {
            id_compensacion : compen.id_compensacion,
            codigo : compen.codigo,
            nombre : compen.nombre,
            orden : compen.orden
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete compensacion
     */
    deleteCompensacion(id_compensacion: string): Observable<any>
    {

        return from(this._apiErp.post('reclamo/Compensacion/eliminarCompensacion', {
            id_compensacion: id_compensacion
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );
    }
    /********************************* COMPENSATION *********************************/

    /********************************* HOLIDAY *********************************/
    /**
     * GET feriado
     */
    getFeriado():Observable<{ pagination: any; feriados: any[] }>{

        return from(this._apiErp.post('reclamo/Feriados/listarFeriados',{
            start:0,
            limit:50,
            sort:'fecha',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'fecha';
                const order = 'asc';
                const page = 0 ;
                const size = response.total;
                // Clone the products
                let feriados: any[] | null =  response.datos;

                // Sort clientes
                if ( sort === 'fecha' )
                {
                    feriados.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    feriados.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = response.total;

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
                    feriados = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    feriados = feriados.slice(begin, end);

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
                this._feriado$.next(response.datos);

                return of({feriados,pagination});
            })
        );
    }

    /**
     * search cliente
     * @param search
     */
    searchFeriado(p_search = ''):Observable<{ pagination: any; feriados: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'fecha';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the products
        let feriados: any[] | null = this._feriado$.getValue();

        // Sort the products
        if ( sort === 'fecha' )
        {
            feriados.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            feriados.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            feriados = feriados.filter(compen => compen.orden.toLowerCase().includes(search.toLowerCase())
                || compen.codigo.toLowerCase().includes(search.toLowerCase())
                || compen.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = feriados.length;

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
            feriados = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            feriados = feriados.slice(begin, end);

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

        return of({feriados,pagination});
    }

    /**
     * POST feriado
     */
    postFeriado(feriado: object): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Feriados/insertarFeriados', feriado)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * DELETE feriado
     */
    deleteFeriado(id_feriado: string): Observable<any>
    {

        return from(this._apiErp.post('reclamo/Feriados/eliminarFeriados', {id_feriado})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );
    }
    /********************************* HOLIDAY *********************************/


    /********************************* INCIDENT TYPE *********************************/


    /**
     * Get tipo incidentes
     *
     */
    getTipoIncidente(id_tipo_incidente: string = ''):Observable<any[]>{


        return from(this._apiErp.post('reclamo/TipoIncidente/listarTipoIncidenteArb',{
            start:0,
            limit:50,
            id_tipo_incidente : id_tipo_incidente == '0' ? '' : id_tipo_incidente,
            node : id_tipo_incidente == '0' ? 'id' : id_tipo_incidente
        })).pipe(
            switchMap((response: any) => {
                /*let treeStructure = this._tipoIncidente$.getValue();
                console.warn('treeStructure', treeStructure);*/
                // Return a new observable with the response
                this._tipoIncidente$.next(response);
                return of(response);
            })
        );
    }

    /********************************* INCIDENT TYPE *********************************/

    /********************************* HALF CLAIM *********************************/
    getMedioReclamo():Observable<{ pagination: any; medios: any[] }>{

        return from(this._apiErp.post('reclamo/MedioReclamo/listarMedioReclamo',{
            start:0,
            limit:50,
            sort:'orden',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'nombre_medio';
                const order = 'asc';
                const page = 0 ;
                const size = 100;
                // Clone the products
                let medios: any[] | null =  response.datos;

                // Sort the products
                if ( sort === 'nombre_medio' )
                {
                    medios.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    medios.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const productsLength = medios.length;

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
                    medios = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    medios = medios.slice(begin, end);

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
                // Return a new observable with the response
                this._medioReclamo$.next(response.datos);
                return of({medios,pagination});
            })
        );
    }


    /**
     * search Medio Reclamo
     * @param search
     */
    searchMedioReclamo(p_search = ''):Observable<{ pagination: any; medios: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'orden';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the products
        let medios: any[] | null = this._medioReclamo$.getValue();
        // Sort the products
        if ( sort === 'orden' )
        {
            medios.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            medios.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            medios = medios.filter(medio => medio.orden.toLowerCase().includes(search.toLowerCase())
                || medio.codigo.toLowerCase().includes(search.toLowerCase())
                || medio.nombre_medio.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const productsLength = medios.length;

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
            medios = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            medios = medios.slice(begin, end);

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

        return of({medios,pagination});

    }

    /**
     * Post medio reclamo
     */
    postMedioReclamo(medio: any): Observable<any>
    {

        return from(this._apiErp.post('reclamo/MedioReclamo/insertarMedioReclamo', {
            id_medio_reclamo : medio.id_medio_reclamo,
            codigo : medio.codigo,
            nombre_medio : medio.nombre_medio,
            orden : medio.orden
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete medio reclamo
     */
    deleteMedioReclamo(id_medio_reclamo: string): Observable<any>
    {
        return from(this._apiErp.post('reclamo/MedioReclamo/eliminarMedioReclamo', {
            id_medio_reclamo: id_medio_reclamo
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );
    }
    /********************************* HALF CLAIM *********************************/


    /********************************* CANCELLATION REASON *********************************/
    getMotivoAnulacion():Observable<{ pagination: any; motivos: any[] }>{

        return from(this._apiErp.post('reclamo/MotivoAnulado/listarMotivoAnulado',{
            start:0,
            limit:50,
            sort:'orden',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'orden';
                const order = 'asc';
                const page = 0 ;
                const size = 10000000;
                // Clone the products
                let motivos: any[] | null =  response.datos;

                // Sort the products
                if ( sort === 'orden' )
                {
                    motivos.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    motivos.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = motivos.length;

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
                    motivos = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    motivos = motivos.slice(begin, end);

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
                this._motivoAnulacion$.next(response.datos);

                return of({motivos,pagination});
            })
        );
    }

    /**
     * search motivo anulacion
     * @param search
     */
    searchMotivoAnulacion(p_search = ''):Observable<{ pagination: any; motivos: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'orden';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the products
        let motivos: any[] | null = this._motivoAnulacion$.getValue();

        // Sort the products
        if ( sort === 'orden' )
        {
            motivos.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            motivos.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            motivos = motivos.filter(compen => compen.orden.toLowerCase().includes(search.toLowerCase())
                || compen.codigo.toLowerCase().includes(search.toLowerCase())
                || compen.nombre.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = motivos.length;

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
            motivos = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            motivos = motivos.slice(begin, end);

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

        return of({motivos,pagination});
    }

    /**
     * Post motivo anulacion
     */
    postMotivoAnulacion(motivo: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/MotivoAnulado/insertarMotivoAnulado', {
            id_motivo_anulado : motivo.id_motivo_anulado,
            motivo : motivo.motivo,
            orden : motivo.orden
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete motivo anulacion
     */
    deleteMotivoAnulacion(id_motivo_anulado: string): Observable<any>
    {
        return from(this._apiErp.post('reclamo/MotivoAnulado/eliminarMotivoAnulado', {
            id_motivo_anulado: id_motivo_anulado
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /********************************* CANCELLATION REASON *********************************/

    /********************************* OFFICE *********************************/

    /**
     * GET Oficina
     */
    getOficina():Observable<{ pagination: any; oficinas: any[] }>{

        return from(this._apiErp.post('reclamo/OficinaReclamo/listarOficina',{
            start:0,
            limit:50,
            sort:'id_oficina',
            dir:'desc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'id_oficina';
                const order = 'desc';
                const page = 0 ;
                const size = response.total;
                // Clone the products
                let oficinas: any[] | null =  response.datos;

                // Sort clientes
                if ( sort === 'id_oficina' )
                {
                    oficinas.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    oficinas.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = response.total;//clientes.length;

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
                    oficinas = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    oficinas = oficinas.slice(begin, end);

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
                this._oficina$.next(response.datos);

                return of({oficinas,pagination});
            })
        );
    }

    /**
     * search cliente
     * @param search
     */
    searchOficina(p_search = ''):Observable<{ pagination: any; oficinas: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'id_oficina';
        const order = 'desc';
        const page = 0 ;
        const size = 10000000;
        // Clone the products
        let oficinas: any[] | null = this._oficina$.getValue();

        // Sort the products
        if ( sort === 'id_oficina' )
        {
            oficinas.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            oficinas.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            oficinas = oficinas.filter(ofi =>
                ofi.codigo?.toLowerCase().includes(search.toLowerCase())
                || ofi.nombre?.toLowerCase().includes(search.toLowerCase())
                || ofi.correo_oficina?.toLowerCase().includes(search.toLowerCase())
                || ofi.direccion?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = oficinas.length;

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
            oficinas = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            oficinas = oficinas.slice(begin, end);

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

        return of({oficinas,pagination});
    }

    /**
     * POST oficina
     */
    postOficina(oficina: object): Observable<any>
    {

        return from(this._apiErp.post('reclamo/OficinaReclamo/insertarOficina', oficina)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * DELETE oficina
     */
    deleteOficina(id_oficina: string): Observable<any>
    {
        return from(this._apiErp.post('reclamo/OficinaReclamo/eliminarOficina', {id_oficina})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /********************************* OFFICE *********************************/


    /***************************************** ROLES *****************************************/
        // Private
    private _role: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _countries: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _parameters: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _values: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get role$(): Observable<any>
    {
        return this._role.asObservable();
    }

    /**
     * Getter for contacts
     */
    get roles$(): Observable<any[]>
    {
        return this._roles.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<any[]>
    {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<any[]>
    {
        return this._tags.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get roles
     */
    getRoles(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/claims-management/getRolesList').pipe(
            tap((roles: any) => {
                this._roles.next(JSON.parse(roles.datos[0].roles_list));
            })
        );
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
    searchContacts(query: string): Observable<any[]>
    {
        /*return this._httpClient.get<Contact[]>('api/apps/contacts/search', {
            params: {query}
        }).pipe(
            tap((contacts) => {
                this._roles.next(contacts);
            })
        );*/
        return from(this._apiErp.post('reclamo/OficinaReclamo/eliminarOficina', {query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Get contact by id
     */
    getRoleById(id: string): Observable<any>
    {
        return this._roles.pipe(
            take(1),
            map((roles) => {

                // Find the contact
                const rol = roles.find(item => item.id === id) || null;

                // Update the contact
                this._role.next(rol);

                // Return the contact
                return rol;
            }),
            switchMap((rol) => {

                if ( !rol )
                {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(rol);
            })
        );

        /*return from(this._apiErp.post('reclamo/OficinaReclamo/eliminarOficina', {id})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );*/
    }

    /**
     * Create role
     */
    createRole(): Observable<any>
    {
        const newRole = {
            id          : BobyMockApiUtils.guid(),
            name        : 'Nuevo Rol',
            notes       : '',
            roles       : [],
            states      : [],
            officials   : []
        };

        // Update the roles with the new role
        this._roles.next([newRole, ...this._roles.getValue()]);
        // Return the new role
        return of(newRole);
    }


    /**
     * Get Parameters
     */
    getParameters(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/claims-management/getParameters').pipe(
            switchMap((params: any) => {
                return of(JSON.parse(params.datos[0].djson));
                /*this._parameters.next(JSON.parse(params.datos[0].djson));*/
            })
        );
    }

    /**
     * Add label
     *
     * @param label
     */
    addValue(value,id_settings): Observable<any>
    {

        const newValue = cloneDeep(value);
        newValue.id = BobyMockApiUtils.guid();

        newValue.slug = newValue.title.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[-]+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Check if the slug is being used and update it if necessary
        const originalSlug = newValue.slug;

        let sameSlug;
        let slugSuffix = 1;

        do{
            sameSlug = this._values.getValue().filter(item => item.slug === newValue.slug);

            if ( sameSlug.length > 0 )
            {
                newValue.slug = originalSlug + '-' + slugSuffix;
                slugSuffix++;
            }
        }
        while ( sameSlug.length > 0 );

        // Update the roles with the new role
        //this._values.next([newValue, ...this._values.getValue()]);
        // Return the new value
        return this._httpClient.post('api/apps/claims-management/postValue', {newValue, id_settings}).pipe(
            tap((value: any) => {
                this._values.next([newValue, ...this._values.getValue()]);
                return of(newValue);
            }),
            catchError(error =>{
                return of(error);
            })
        );
        //return of(newValue);
    }

    /**
     * Update value
     *
     * @param id
     * @param value
     */
    updateValue(id_settings, id, value: any): Observable<any>
    {
        let updatedValue = null;
        // Find the label and update it
        this._values.getValue().forEach((item, index, labels) => {

            if ( item.id === id )
            {
                // Update the slug
                value.slug = value.title.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[-]+/g, '-')
                    .replace(/[^\w-]+/g, '');

                // Update the label
                labels[index] = assign({}, labels[index], value);

                // Store the updated label
                updatedValue = labels[index];
            }
        });

        return this.values$.pipe(
            take(1),
            switchMap(values => this._httpClient.patch<any>('api/apps/claims-management/patchValue', {
                id_settings,
                id,
                updatedValue
            }).pipe(
                map((reponse: any) => {
                    // Find the index of the updated label within the labels
                    const index = values.findIndex(item => item.id === id);
                    // Update the label
                    values[index] = updatedValue;

                    // Update the labels
                    this._values.next(values);

                    // Return the updated label
                    return reponse;
                })
            ))
        );
    }

    /**
     * Delete value
     *
     * @param id
     */
    deleteValue(id_settings, id): Observable<any>
    {
        return this.values$.pipe(
            take(1),
            switchMap(values => this._httpClient.delete('api/apps/claims-management/deleteValue', {params: {id_settings,id}}).pipe(
                map((isDeleted: any) => {

                    // Find the index of the deleted label within the labels
                    const index = values.findIndex(item => item.id === id);

                    // Delete the label
                    values.splice(index, 1);

                    // Update the labels
                    this._values.next(values);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set values(value)
    {
        // Store the value
        this._values.next(value);
    }

    get values$(): Observable<any[]>
    {
        return this._values.asObservable();
    }

    /**
     * Post Parameter
     */
    postParameter(parameter): Observable<any[]>
    {
        return this._httpClient.post('api/apps/claims-management/postParameter', parameter).pipe(
            tap((params: any) => {
                return of(params);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Post Parameter
     */
    deleteParameter(id_settings): Observable<any[]>
    {
        return this._httpClient.delete('api/apps/claims-management/deleteParameter', {params: {id_settings}}).pipe(
            tap((params: any) => {
                return of(params);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: string, contact: any): Observable<any>
    {
        return this.roles$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.patch<any>('api/apps/contacts/contact', {
                id,
                contact
            }).pipe(
                map((updatedContact) => {

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = updatedContact;

                    // Update the contacts
                    this._roles.next(contacts);

                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.role$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._role.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: string): Observable<boolean>
    {
        return this.roles$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.delete('api/apps/contacts/contact', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Delete the contact
                    contacts.splice(index, 1);

                    // Update the contacts
                    this._roles.next(contacts);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get countries
     */
    getCountries(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/contacts/countries').pipe(
            tap((countries) => {
                this._countries.next(countries);
            })
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/contacts/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: any): Observable<any>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<any>('api/apps/contacts/tag', {tag}).pipe(
                map((newTag) => {

                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: any): Observable<any>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<any>('api/apps/contacts/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/contacts/tag', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.roles$.pipe(
                    take(1),
                    map((contacts) => {

                        // Iterate through the contacts
                        contacts.forEach((contact) => {

                            const tagIndex = contact.tags.findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if ( tagIndex > -1 )
                            {
                                contact.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }

    /**
     * Update the avatar of the given contact
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, avatar: File): Observable<any>
    {
        return this.roles$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<any>('api/apps/contacts/avatar', {
                id,
                avatar
            }, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': avatar.type
                }
            }).pipe(
                map((updatedContact) => {

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = updatedContact;

                    // Update the contacts
                    this._roles.next(contacts);

                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.role$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._role.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }

    /**
     * Get status list
     *
     */
    getStatusList(codigo: string = ''):Observable<any[]>{


        return from(this._apiErp.post('reclamo/Reclamo/getStatusList',{codigo})).pipe(
            switchMap((response: any) => {

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Get role list
     *
     */
    getRolesList():Observable<any[]>{


        return from(this._apiErp.post('reclamo/Reclamo/getRolesList',{})).pipe(
            switchMap((response: any) => {

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Save Rol
     */
    saveRole(rol: any): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/insertRol',rol)).pipe(
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    /**
     * Delete Rol
     */
    deleteRole(id_rol: any): Observable<any[]>
    {
        /*return from(this._httpClient.post('api/apps/claims-management/deleteRole',rol))*/
        return from(this._httpClient.delete('api/apps/claims-management/deleteRole', {params: {id_rol}})).pipe(
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    /***************************************** ROLES *****************************************/

    /***************************************** CUSTOMER *****************************************/

    /**
     * Get customer by id
     */
    getCustomerById(id: string): Observable<any>
    {
        return this.customers$.pipe(
            take(1),
            map((customers) => {
                // Find the contact
                const customer = customers.find(item => item.id_cliente === id) || null;
                // Update the contact
                this._customer.next(customer);

                // Return the contact
                return customer;
            }),
            switchMap((customer) => {

                if ( !customer )
                {
                    return throwError('No se pudo encontrar el cliente con ID ' + id + '!');
                }

                return of(customer);
            })
        );

    }
    /***************************************** CUSTOMER *****************************************/

}
