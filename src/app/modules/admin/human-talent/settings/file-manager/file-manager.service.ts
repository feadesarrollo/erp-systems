import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import {catchError, map, switchMap, take, tap} from 'rxjs/operators';
import {BobyMockApiUtils} from "../../../../../../@boby/lib/mock-api";
import {ApiErpService} from "../../../../../core/api-erp/api-erp.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

    // Private
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Getter for items
     */
    get items$(): Observable<any>
    {
        return this._items.asObservable();
    }

    /**
     * Setter for items
     * @param value
     */
    set items(value)
    {
        // Store the value
        this._items.next(value);
    }

    /**
     * Getter for item
     */
    get item$(): Observable<any>
    {
        return this._item.asObservable();
    }

    /**
     * Setter for item
     *
     * @param value
     */
    set item(value)
    {
        // Store the value
        this._item.next(value);
    }

    /**
     * Create role
     */
    createTemplateFile(): Observable<any>
    {
        const newTemplate = {
            id                  : BobyMockApiUtils.guid(),
            folderId            : '',
            name                : 'Nuevo Archivo',
            format              : '',
            createdBy           : '',
            createdAt           : '',
            modifiedAt          : '',
            id_tipo_contrato    : '',
            category            : '',
            type                : '',
            description         : '',
            id_template         : '',
            unit_list           : '',
            id_template_fk      : ''
        };

        const item = {json_template: newTemplate};
        // Update the roles with the new role

        let files = [item, ...this._items.getValue().files];

        const objItems = {files:files, folders: this._items.getValue().folders,path: this._items.getValue().path};

        this._items.next(objItems);
        // Return the new item
        return of(item);
    }

    postTemplateFile(file){
        return this._httpClient.post('api/apps/human-talent/postTemplateFile', file).pipe(
            tap((files: any) => {
                return of(files);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Get template file
     *
     */
    getTemplateFile(folderId: string | null = null):Observable<any[]>{
        return this._httpClient.get<any>('api/apps/human-talent/getTemplateFile', {params: {folderId}}).pipe(
            tap((response: any) => {
                this._items.next(response);
            })
        );
    }

    /**
     * Get item by id
     */
    getItemById(id: string): Observable<any>
    {
        return this._items.pipe(
            take(1),
            map((items) => {

                // Find within the folders and files
                const item = [...items.folders, ...items.files].find(value => value.json_template.id === id) || null;

                // Update the item
                this._item.next(item);

                // Return the item
                return item;
            }),
            switchMap((item) => {

                if ( !item )
                {
                    return throwError('No se pudo encontrar el artículo con id ' + id + '!');
                }

                return of(item);
            })
        );
    }

    deleteTemplateFile(id_template){
        return this.items$.pipe(
            take(1),
            switchMap(values => this._httpClient.delete('api/apps/human-talent/deleteTemplateFile', {params: {id_template}}).pipe(
                map((isDeleted: any) => {
                    // Find the index of the deleted label within the labels
                    const index = values.files.findIndex(item => item.id_template === id_template);
                    // Delete the label
                    values.files.splice(index, 1);
                    // Update the labels
                    this._items.next(values);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get contract type
     */
    getContractType(): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/TipoContrato/listarTipoContrato',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'tipcon.nombre#tipcon.codigo'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }

    /**
     * Get addenda
     */
    getAddenda(): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/TipoDocumentoContrato/getAddenda',{start:0,limit:50,sort:'nombre',dir:'asc',par_filtro:'tipcon.nombre#tipcon.codigo'})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].djson));
            })
        );
    }

    postContentsTemplate(contents, id){
        return from(this._apiErp.post('organigrama/TipoDocumentoContrato/postContentsTemplate',{
            contents,
            id
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
}
