import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from "rxjs";
import { ApiErpService } from "../../../core/api-erp/api-erp.service";
import { switchMap, tap } from "rxjs/operators";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClaimsManagementService {

    private _reclamos: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _reclamo: BehaviorSubject<any | null> = new BehaviorSubject(null);
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Getter for courses
     */
    get reclamos$(): Observable<any[]>
    {
        return this._reclamos.asObservable();
    }

    /**
     * Getter for course
     */
    get reclamo$(): Observable<any>
    {
        return this._reclamo.asObservable();
    }


    /**
     * Get Reclamos
     */
    getReclamos(estado = 'borrador', id_gestion, start, limit): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/listClaims',{estado, id_gestion, start, limit})).pipe(
            switchMap((response: any) => {
                return of(JSON.parse(response.datos[0].jsondata));
            })
        );
    }

    /**
     * Load Cliente
     */
    searchOficina(query: string): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/OficinaReclamo/listarOficina',
            {start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'ofi.nombre#ofi.codigo#lug.nombre',query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Funcionario
     */
    searchFuncionario(query: string): Observable<any[]>
    {

        return from(this._apiErp.post('organigrama/Funcionario/listarFuncionarioCargo',{start:0,limit:50,sort:'desc_funcionario2',dir:'asc',par_filtro:'FUNCAR.desc_funcionario2',query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Cliente
     */
    searchCliente(query: string): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Cliente/listarCliente',{start:0,limit:50,sort:'nombre_completo2',dir:'asc',par_filtro:'c.nombre_completo2#c.ci#c.email',query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Lugar
     */
    searchLugar(query: string): Observable<any[]>
    {
        return from(this._apiErp.post('parametros/Lugar/listarLugar',{start:0,limit:50,sort:'nombre',dir:'ASC',par_filtro:'lug.nombre',es_regional:'si', query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Sub Tipo Incidente
     */
    loadSubTipoIncidente(id_tipo_incidente): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/TipoIncidente/listarTipoIncidente',{fk_tipo_incidente:id_tipo_incidente,start:0,limit:50})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Tipo Incidente
     */
    loadTipoIncidente(): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/TipoIncidente/listarTipoIncidente',{nivel:1,fk_tipo_incidente:1,start:0,limit:50, sort:'nombre_incidente',dir:'ASC'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }


    /**
     * Load Medio Reclamo
     */
    loadMedioReclamo(): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/MedioReclamo/listarMedioReclamo',{start:0,limit:50, sort:'orden',dir:'asc'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Motivo Anulado
     */
    loadMotivoAnulado(): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/MotivoAnulado/listarMotivoAnulado',{start:0,limit:50, sort:'motivo',dir:'asc'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Load Sub Tipo Incidente
     */
    onSiguienteEstado(id_proceso_wf, id_tipo_estado)//: Observable<any[]>
    {

        return from(this._apiErp.post('workflow/ProcesoWf/checkNextState',{
            id_proceso_wf: id_proceso_wf,
            id_tipo_estado_sig: id_tipo_estado
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );

    }

    /**
     * Load Sub Tipo Incidente
     */
    checkSiguienteEstado(id_proceso_wf: any): Observable<any[]>
    {
        return from(this._apiErp.post('workflow/ProcesoWf/verficarSigEstProcesoWf',{
            id_proceso_wf:id_proceso_wf,
            operacion: 'verificar'
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );

    }

    /**
     * Load tipo estado
     */
    loadTipoEstado(data: any): Observable<any[]>
    {
        return from(this._apiErp.post('workflow/TipoEstado/listarTipoEstado',{
            start:0,
            limit:50,
            sort: 'tipes.codigo',
            dir: 'asc',
            estados: data.estados,
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load funcionario workflow
     */
    loadFuncionarioWf(data: any): Observable<any[]>
    {

        return from(this._apiErp.post('workflow/TipoEstado/listarFuncionarioWf',{
            start:0,
            limit:50,
            sort: 'prioridad',
            dir: 'asc',
            id_estado_wf: data.id_estado_wf,
            id_tipo_estado: data.id_tipo_estado,
            fecha: ''
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load departamento workflow
     */
    loadDepartamentoWf(data: any): Observable<any[]>
    {
        return from(this._apiErp.post('workflow/TipoEstado/listarDeptoWf',{
            start:0,
            limit:50,
            sort: 'prioridad',
            dir: 'asc',
            id_estado_wf: data.id_estado_wf,
            id_tipo_estado: data.id_tipo_estado,
            fecha: ''
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load tipo estado
     */
    changeFuncionarioWf(data: any): Observable<any[]>
    {
        return from(this._apiErp.post('workflow/TipoEstado/listarTipoEstado',{
            start:0,
            limit:50,
            sort: 'tipes.codigo',
            dir: 'asc',
            estados: data.estados,
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load tipo estado
     */
    onChangeWizard(data: any): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Reclamo/siguienteEstadoReclamo',{
            id_proceso_wf_act: data.id_proceso_wf_act,
            id_estado_wf_act: data.id_estado_wf_act,
            id_tipo_estado: data.id_tipo_estado,
            id_funcionario_wf: data.id_funcionario_wf,
            id_depto_wf: data.id_depto_wf,
            obs: data.obs,
            json_procesos: data.json_procesos,
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );

    }

}
