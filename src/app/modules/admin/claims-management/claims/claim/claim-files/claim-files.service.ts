import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, of, switchMap, from } from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {ApiErpService} from "../../../../../../core/api-erp/api-erp.service";

@Injectable({
  providedIn: 'root'
})
export class ClaimFilesService {

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _documents$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

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
    get archivos$(): Observable<any[]>
    {
        return this._products.asObservable();
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
    getArchivos(p_page: number = 0, p_size: number = 10, p_sort: string = 'nombre_tipo_documento', p_order: 'asc' | 'desc' | '' = 'asc', p_search = '', reclamo: any = null):
        Observable<{ pagination: any; documentos: any[] }>
    {

        /*return from(this._apiErp.post('workflow/DocumentoWf/listarDocumentoWf',{
            start:0,
            limit:50,
            sort:'id_documento_wf',
            dir:'desc',
            id_proceso_wf:reclamo.id_proceso_wf,
            todos_documentos:'si'
        }))*/
        return from(this._httpClient.post('api/apps/claims-management/listWfDocuments',{
            start:0,
            limit:50,
            sort:'id_documento_wf',
            dir:'desc',
            id_proceso_wf:reclamo.id_proceso_wf,
            todos_documentos:'si'
        })).pipe(
            switchMap((resp: any) => {
                // Get available queries
                const search = p_search;
                const sort = p_sort;
                const order = p_order;
                const page = p_page ;
                const size = p_size;
                // Clone the products
                let documentos: any[] | null =  resp.datos;

                // Sort the products
                if ( p_sort === 'nombre_tipo_documento' )
                {
                    documentos.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    documentos.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // If search exists...
                if ( search )
                {
                    // Filter the products
                    documentos = documentos.filter(archivo => archivo.nombre_tipo_documento && archivo.nombre_tipo_documento.toLowerCase().includes(search.toLowerCase()));
                }

                // Paginate - Start
                const productsLength = documentos.length;

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
                    documentos = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    documentos = documentos.slice(begin, end);

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

                /*this._pagination.next(pagination);
                this._products.next(documentos);*/
                this._documents$.next(documentos);
                return of({documentos,pagination});
            })
        );
    }

    /**
     * Upload archivo al server
     */
    onUploadArchivo(/*upload: any, */id_proceso_wf: any, id_documento_wf: any, archivo: File, imageSrc: any): Observable<any>
    {



        return from(this._apiErp.post('reclamo/Reclamo/uploadArchivo',{
            id_proceso_wf: id_proceso_wf,
            id_documento_wf: id_documento_wf,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1]
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.ROOT);
            })
        );
    }

    downloadArchivo(id_proceso_wf: number, action: string)
    {

        let partitionAction = action.split('/').filter(item => item != 'control' && item != '');
        partitionAction[0] = 'reclamo';
        //'reclamo/Reclamo/reporteReclamoDoc'
        return from(this._apiErp.post(partitionAction.join('/'), {id_proceso_wf, action})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

}
