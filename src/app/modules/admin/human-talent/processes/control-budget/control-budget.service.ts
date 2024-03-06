import { Injectable } from '@angular/core';
import {ApiErpService} from "../../../../../core/api-erp/api-erp.service";
import {catchError, switchMap} from "rxjs/operators";
import { BehaviorSubject, of, Observable, throwError, from } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ControlBudgetService {

    private _budgets: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _budget: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    constructor(
        private _apiErp:ApiErpService
    ) { }

    /**
     * Getter for budgets
     */
    get budgets$(): Observable<any[]>
    {
        return this._budgets.asObservable();
    }

    /**
     * Getter for budget
     */
    get budget$(): Observable<any>
    {
        return this._budget.asObservable();
    }

    /**
     * Getter for budget
     */
    set budget(budget)
    {
        this._budget.next(budget);
    }

    getCentroCosto(): Observable<any[]>{
        return from(this._apiErp.post('parametros/CentroCosto/listarCentroCosto',{
            start:0,
            limit:50,
            sort:'codigo_cc',dir:'asc',
            tipo_pres:'gasto,administrativo,ingreso_egreso',
            filtrar:'grupo_ep',
            estado:'aprobado',
            id_gestion:'23',
            par_filtro:'id_centro_costo#codigo_cc#codigo_uo#nombre_uo#nombre_actividad#nombre_programa#nombre_proyecto#nombre_regional#nombre_financiador'
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
     * Search centro
     */
    searchCentro(query, params): Observable<any[]>
    {
        return from(this._apiErp.post('parametros/CentroCosto/listarCentroCosto',{
            start:0,limit:50,sort:'codigo_cc',dir:'asc',tipo_pres:'gasto,administrativo,ingreso_egreso',
            par_filtro :'codigo_cc#codigo_uo#nombre_uo#nombre_actividad#nombre_programa#nombre_proyecto#nombre_regional#nombre_financiador',
            filtrar :'grupo_ep',
            estado : 'aprobado',
            id_gestion : params.id_gestion,
            query
        })).pipe(
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
     * Get control Budget
     */
    getControlBudget(id_uo,type): Observable<any>
    {
        return from(this._apiErp.post('organigrama/EstructuraUo/getControlBudget', {id_uo,type})).pipe(
            switchMap((resp: any) => {
                const djson = JSON.parse(resp.datos[0].djson);
                this._budgets.next(djson);
                // Return the budgets
                return of(djson);
            })
        );

    }

    /**
     * Get search fin
     */
    searchFin(query): Observable<any>
    {
        return from(this._apiErp.post('organigrama/EstructuraUo/searchFin', {query})).pipe(
            switchMap((resp: any) => {
                const djson = JSON.parse(resp.datos[0].djson);
                // Return tree budgets
                return of(djson);
            })
        );

    }


    /**
     * Get summative by id
     */
    getBudgetById(id: string): Observable<any>
    {
        return from(this._apiErp.post('organigrama/CargoPresupuesto/listarCargoPresupuesto', {
            start : 0,
            limit : 50,
            sort:'id_cargo_presupuesto',
            dir:'asc',
            id_cargo_presupuesto : id
        })).pipe(
            switchMap((resp: any) => {
                const djson = resp.datos[0];
                this._budget.next(djson);
                // Return the budgets
                return of(djson);
            })
        );
    }

    postBudget(budget){
        return from(this._apiErp.post('organigrama/CargoPresupuesto/insertarCargoPresupuesto',budget)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError((error)=>{
                console.warn('error',error);
                return of(error);
            })
        );
    }
}
