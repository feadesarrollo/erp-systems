import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import {BobyMockApiUtils} from "../../../../../../@boby/lib/mock-api";
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {
    // Private
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

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
     * Get template file
     *
     */
    getTemplateFile(folderId: string | null = null):Observable<any[]>{
        return this._httpClient.get<any>('api/apps/claims-management/getTemplateFile', {params: {folderId}}).pipe(
            tap((response: any) => {
                //this._items.next(JSON.parse(response.datos[0].djson));
                this._items.next(response);
            })
        );
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
            contents            : '',
            description         : '',
            category            : '',
            type                : '',
            id_template         : '',
            id_tipo_incidente   : ''
        };

        const item = {json_template: newTemplate};
        // Update the roles with the new role

        let files = [item, ...this._items.getValue().files];

        const objItems = {files:files, folders: this._items.getValue().folders,path: this._items.getValue().path};

        this._items.next(objItems);
        //this._items.next([item, ...this._items.getValue()]);
        // Return the new role
        return of(item);
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
                //const item = items.find(value => value.json_template.id === id) || null;
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
            switchMap(values => this._httpClient.delete('api/apps/claims-management/deleteTemplateFile', {params: {id_template}}).pipe(
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
}
