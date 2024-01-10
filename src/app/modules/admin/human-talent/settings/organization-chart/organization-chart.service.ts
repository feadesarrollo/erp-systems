import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable, throwError, from } from "rxjs";
import {take, map, tap, filter, switchMap,} from "rxjs/operators";
import {ApiErpService} from "../../../../../core/api-erp/api-erp.service";
import {HttpClient} from "@angular/common/http";
import {Validators} from "@angular/forms";
@Injectable({
  providedIn: 'root'
})
export class OrganizationChartService {

    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _statusItem: BehaviorSubject<any | null> = new BehaviorSubject('');
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) {}

    /**
     * Getter for status item
     */
    get statusItem$(): Observable<any>
    {
        return this._statusItem.asObservable();
    }

    /**
     * Setter for status item
     */
    set statusItem(value)
    {
        this._statusItem.next(value);
    }

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
     * Getter for summative
     */
    set item(item)
    {
        this._item.next(item);
    }

    /**
     * Getter for items
     */
    get item$(): Observable<any[]>
    {
        return this._item.asObservable();
    }

    /**
     * Post item
     */
    createItem(): Observable<any>
    {
        return from(this._apiErp.post('organigrama/Cargo/getCargoId', {})).pipe(
            switchMap((resp: any) => {
                const newItem = {
                    id_cargo: resp.data.id_cargo,
                    id_tipo_contrato: '',
                    id_oficina: '',
                    id_uo: '',
                    id_temporal_cargo: '',
                    id_escala_salarial: '',
                    codigo: '',
                    fecha_ini: '',
                    fecha_fin: '',

                    id_gestion: '',
                    id_centro_costo: '',
                    id_ot: '',
                    porcentaje: '',
                    fecha_ini_cc: '',
                    fecha_fin_cc: ''
                };
                this._items.next([newItem, ...this._items.getValue()]);
                // Update the roles with the new role
                //this._summatives.next([newSummative, ...this._summatives.getValue()]);
                // Return the new customer
                return of(newItem);
            })
        );

    }

    getItems(id_uo, start, limit, sort, dir, query):Observable<{ pagination: any; items: any[]; total: any; }>{

        return from(this._httpClient.get<{ pagination: any; items: any[]; total: any; }>('api/apps/human-talent/getItems', {params: {id_uo, start,limit,sort,dir,query}})).pipe(
            tap((response) => {
                //this._pagination.next(response.pagination);
                this._items.next(response.items);
                return response;
            })
        );
    }

    getAllocations(id_uo,start,limit,status):Observable<{ pagination: any; items: any[] }>{

        return from(this._httpClient.get<{ pagination: any; items: any[] }>('api/apps/human-talent/getAllocations', {params: {id_uo, start,limit,status}})).pipe(
            tap((response) => {
                //this._pagination.next(response.pagination);
                //this._items.next(response.items);
                return response;
            })
        );
    }

    /**
     * Get item by id
     */
    getItemById(id: string): Observable<any>
    {
        return this.items$.pipe(
            take(1),
            map((items) => {
                // Find the contact
                const item = items.find(item => item.id_cargo === id) || null;
                // Update the contact
                this._item.next(item);

                // Return the contact
                return item;
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

    /**
     * Get contract
     */
    getContractList(): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/TipoContrato/listarTipoContrato',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'tipcon.nombre#tipcon.codigo'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Search office
     */
    searchOffice(query): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/Oficina/listarOficina',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'ofi.nombre#ofi.codigo#lug.nombre',query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Search item
     */
    searchItem(query): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/TemporalCargo/listarTemporalCargo',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'cargo.nombre',query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }
    /**
     * Search year
     */
    searchScale(query): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/EscalaSalarial/listarEscalaSalarial',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'escsal.haber_basico#escsal.nombre#escsal.codigo',query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Search year
     */
    searchYear(query): Observable<any[]>
    {
        return from(this._apiErp.post('parametros/Gestion/listarGestion',{start:0,limit:50,sort:'gestion',dir:'desc',par_filtro:'gestion',query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Search centro
     */
    searchCentro(query, params): Observable<any[]>
    {
        return from(this._apiErp.post('parametros/CentroCosto/listarCentroCosto',{
            start:0,limit:50,sort:'codigo_cc',dir:'desc',tipo_pres:'gasto,administrativo,ingreso_egreso',
            par_filtro:'codigo_cc#codigo_uo#nombre_uo#nombre_actividad#nombre_programa#nombre_proyecto#nombre_regional#nombre_financiador',
            filtrar:'grupo_ep',id_gestion:"22",id_uo:10113,query
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Search orden
     */
    searchOrden(query): Observable<any[]>
    {
        return from(this._apiErp.post('contabilidad/OrdenTrabajo/listarOrdenTrabajo',{
            start:0,limit:50,sort:'motivo_orden',dir:'asc',par_filtro:'desc_orden#motivo_orden#codigo',query
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Post item
     */
    postItem(item: any, statusItem: string): Observable<any>
    {
        item.statusItem = statusItem;
        const id = item.id_cargo;
        return this.items$.pipe(
            take(1),
            switchMap(items => this._httpClient.post('api/apps/human-talent/postItem',item).pipe(
                map((updatedItem) => {
                    // Find the index of the updated contact
                    const index = items.findIndex(item => item.id_cargo === id);
                    // Update the contact
                    items[index] = item;
                    if (statusItem == 'new'){
                        this.statusItem = 'edit';
                    }
                    // Update the contacts
                    this._items.next(items);

                    // Return the updated contact
                    return item;
                }),
                switchMap(updatedItem => this.item$.pipe(
                    take(1),
                    filter((item: any) => item && item.id_cargo === id),
                    tap(() => {
                        // Update the summative if it's selected
                        this._item.next(updatedItem);
                        // Return the updated summative
                        return updatedItem;
                    })
                ))
            ))
        );
    }
}
