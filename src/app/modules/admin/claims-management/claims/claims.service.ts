import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { ApiErpService } from '../../../../core/api-erp/api-erp.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BobyMockApiUtils} from "../../../../../@boby/lib/mock-api";

@Injectable({
  providedIn: 'root'
})
export class ClaimsService {

    private _reclamos: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _reclamo: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _answers: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _answer: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _roles: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Getter for claims
     */
    get reclamos$(): Observable<any[]>
    {
        return this._reclamos.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for claims
     */
    get reclamo$(): Observable<any>
    {
        return this._reclamo.asObservable();
    }

    /**
     * Save claim
     */
    guardarReclamo(reclamo: any): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/insertarReclamo',reclamo)).pipe(
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    /**
     * Delete claim
     */
    deleteClaim(claim: any): Observable<any>
    {
        return from(this._httpClient.delete('api/apps/claims-management/deleteClaim', {params: {id_reclamo: claim.id_reclamo}})).pipe(
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
     * Get Reclamos
     */
    getReclamos2(estado = 'borrador', id_gestion, start, limit): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/listClaims',{estado, id_gestion, start, limit})).pipe(
            switchMap((response: any) => {
                const resp = JSON.parse(response.datos[0].jsondata);
                this._reclamos.next(resp);
                return of(resp);
            })
        );
    }

    /**
     * Get Reclamos2
     */
    getReclamos(estado = 'borrador', id_gestion, start, limit, sort, dir, query): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/listClaims',{estado, id_gestion, start, limit, sort, dir, query})).pipe(
            switchMap((response: any) => {
                this._reclamos.next(response.claims);
                return of(response);
            })
        );
    }
    /*getReclamos(estado = 'borrador', id_gestion, start, limit, sort, dir):Observable<{ pagination: any; claims: any[] }>{
        return from(this._httpClient.get<{ pagination: any; claims: any[] }>('api/apps/claims-management/listClaims', {params: {estado, id_gestion, start, limit, sort, dir}})).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._reclamos.next(response.claims);
            })
        );
    }*/

    /**
     * filter By Query
     */
    filterByQuery(query, estado, id_gestion, start, limit, sort, dir): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Reclamo/getClaimsList',{estado, id_gestion, start, limit, sort, dir, query, par_filtro:'rec.nro_tramite#rec.correlativo_preimpreso_frd#rec.nro_frd#c.nombre_completo2#rec.nro_vuelo#usu1.cuenta'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );

    }

    /**
     * List form column
     */
    listFormColumn(id_estado_wf): Observable<any[]>
    {

        return from(this._apiErp.post('workflow/TipoColumna/listarColumnasFormulario',{id_estado_wf})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );

    }


    fetchYear(): Observable<any>{
        return from (this._apiErp.post(
            'parametros/Gestion/listarGestion',
            {start:0,limit:50/*,ordenacion:'gestion',dir_ordenacion: 'desc'*/}
        )).pipe(
            switchMap((response: any) => {
                return of(response)
            })
        );
    }


    /**
     * Get claim by id
     */
    getReclamoById(id: string): Observable<any>
    {
        const reclamos = this._reclamos.getValue();
        if ( reclamos == null ){
            return from(this._apiErp.post('reclamo/Reclamo/getClaimById',{id_reclamo: id, start: 0, limit: 1})).pipe(
                switchMap((resp: any) => {

                    const claims = JSON.parse(resp.datos[0].listclaims).claims;

                    // Return a new observable with the response
                    this._reclamos.next(claims);

                    const reclamos = this._reclamos.getValue();

                    // Find the claim
                    const reclamo = reclamos.find(item => item.id_reclamo === Number(id));

                    this._reclamo.next(reclamo);

                    /*return this._httpClient.get<any[]>('api/apps/claims-management/getRolesByOfficial').pipe(
                        tap((roles: any) => {
                            this._roles.next(JSON.parse(roles.datos[0].json_rol));
                            return of(reclamo);
                        })
                    );*/

                    return of(reclamo);

                })
            );
        }else{
            // Find the claim
            const reclamo = reclamos.find(item => item.id_reclamo === +id);

            this._reclamo.next(reclamo);
            return of(reclamo);
        }

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

        return from(this._apiErp.post('organigrama/Funcionario/listarFuncionarioCargo',{start:0,limit:50,sort:'desc_funcionario2',dir:'asc',par_filtro:'FUNCAR.desc_funcionario1',query:query})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );

    }

    /**
     * Load Funcionario
     */
    searchOfficialsEmails(query: string): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Reclamo/getOfficialsEmails',{start:0,limit:50,sort:'desc_funcionario2',dir:'asc',par_filtro:'FUNCAR.desc_funcionario1#FUNCAR.desc_funcionario2',query:query})).pipe(
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
     * Load Sub Tipo Incidente
     */
    getCategoryList(code): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/Reclamo/getCategoryList',{code})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].djson));
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
                return of(resp);
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
                return of(resp);
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
     * Load tipo estado
     */
    loadTipoEstadoProceso(data: any): Observable<any[]>
    {
        return from(this._apiErp.post('workflow/TipoEstado/listarTipoEstado',{
            start:0,
            limit:50,
            sort: 'tipes.codigo',
            dir: 'asc',
            id_tipo_proceso: data.id_tipo_proceso,
            inicio: 'si'
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
    onChangeWizard(data: any, endpoint): Observable<any[]>
    {

        return from(this._apiErp.post(endpoint/*'reclamo/Reclamo/siguienteEstadoReclamo'*/,{
            id_proceso_wf_act: data.id_proceso_wf_act,
            id_estado_wf_act: data.id_estado_wf_act,
            id_tipo_estado: data.id_tipo_estado,
            id_funcionario_wf: data.id_funcionario_wf,
            id_depto_wf: data.id_depto_wf,
            obs: data.obs,
            json_procesos: data.json_procesos === '' ? '[]' : data.json_procesos,
        })).pipe(
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
     * change previous state
     */
    onChangePrevious(previous: any, process: any, endpoint): Observable<any[]>
    {
        //'reclamo/Reclamo/anteriorEstadoReclamo'
        return from(this._apiErp.post(endpoint,{
            id_proceso_wf   : process.id_proceso_wf,
            id_estado_wf    : process.id_estado_wf,
            obs             : previous.obs,
            estado_destino  : 'anterior'
        })).pipe(
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
     * Save Informe
     */
    guardarInforme(informe: any): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Informe/insertarInforme', informe)).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Load Motivo Anulado
     */
    loadCompensacion(): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/Compensacion/listarCompensacion',{start:0,limit:50, sort:'orden',dir:'asc'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**************************************** ANSWERS ****************************************/
    /**
     * Get Answer
     */
    getAnswerList(estado = 'elaboracion_respuesta', gestion, start, limit): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/claims-management/getAnswersList',{
            estado,
            gestion,
            start,
            limit
        })).pipe(
            switchMap((response: any) => {
                this._answers.next(JSON.parse(response.datos[0].listanswer).answers);
                return of(response);
            })
        );
    }

    /**
     * Getter for claims
     */
    get answers$(): Observable<any[]>
    {
        return this._answers.asObservable();
    }

    /**
     * Getter for claims
     */
    get answer$(): Observable<any>
    {
        return this._answer.asObservable();
    }

    /**
     * Get answer by id
     */
    getAnswerById(id: string): Observable<any>
    {
        const answers = this._answers.getValue();
        if ( answers == null ){
            /*return from(this._apiErp.post('reclamo/Reclamo/getClaimById',{id_reclamo: id, start: 0, limit: 1})).pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    this._reclamos.next(JSON.parse(resp.datos[0].listclaims).claims);

                    const reclamos = this._reclamos.getValue();
                    // Find the claim
                    const reclamo = reclamos.find(item => item.id_reclamo === Number(id));
                    this._reclamo.next(reclamo);

                    /!*return this._httpClient.get<any[]>('api/apps/claims-management/getRolesByOfficial').pipe(
                        tap((roles: any) => {
                            this._roles.next(JSON.parse(roles.datos[0].json_rol));
                            return of(reclamo);
                        })
                    );*!/

                    return of(reclamo);

                })
            );*/
        }else{
            // Find the claim
            const answer = answers.find(item => item.id_respuesta === Number(id));
            this._answer.next(answer);
            return of(answer);
        }

    }
    /**************************************** ANSWERS ****************************************/

    /**************************************** ROLES ****************************************/

    /**
     * Getter roles by official
     */
    get rolesByOfficial$(): Observable<any[]>
    {
        return this._roles.asObservable();
    }

    /**
     * Get roles
     */
    getRoles(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/claims-management/getRolesByOfficial').pipe(
            tap((roles: any) => {
                this._roles.next(JSON.parse(roles.datos[0].json_rol));
            })
        );
    }
    /**************************************** ROLES ****************************************/

    /**
     * POST send mail
     */
    sendMail(compose: any, id_reclamo: number): Observable<any[]>
    {
        compose.id_reclamo = id_reclamo;
        return from(this._httpClient.post('api/apps/claims-management/sendMail',{compose})).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( (error) => {
                return of(error)
            })
        );
    }

    /**
     * GET validate FRD
     */
    validateFRD(params): Observable<any[]>
    {

        return from(this._httpClient.post('api/apps/claims-management/validateFRD',{params})).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError( (error) => {
                return of(error)
            })
        );
    }


    /***************************************************TEMPLATE***************************************************/
    /**
     * Load report template
     */
    getTemplateById(id_tipo_incidente, category): Observable<any[]>
    {
        return from(this._apiErp.post('reclamo/Reclamo/getTemplateById',{id_tipo_incidente, category})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp?.datos[0]?.content);
            })
        );

    }
    /***************************************************TEMPLATE***************************************************/

    /**
     * Upload archivo al server
     */
    onUploadFile(id_reclamo: any, archivo: File, imageSrc: any): Observable<any>
    {
        return from(this._apiErp.post('reclamo/Reclamo/onUploadFile',{
            id_reclamo: id_reclamo,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1].length > 7 ? archivo.type.split('/')[1] : archivo.name.split('.')[1],
            fileName: BobyMockApiUtils.guid(),
            name: archivo.name,
            fileType: 'attachment'
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.data);
            })
        );
    }


}
