import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, from, take, map, tap, filter, throwError } from "rxjs";
import { ApiErpService } from '../../../../core/api-erp/api-erp.service';
import {catchError, switchMap} from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { BobyMockApiUtils } from '@boby/lib/mock-api';
import { assign, cloneDeep } from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {

    private _values: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _role: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _countries: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    constructor(private _apiErp:ApiErpService, private _httpClient: HttpClient) { }


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
     * Save Rol
     */
    saveRole(rol: any): Observable<any>
    {
        const id = rol.id;
        return this.roles$.pipe(
            take(1),
            switchMap(roles => this._httpClient.post('api/apps/claims-management/insertRol',rol).pipe(
                map((updatedRole) => {
                    // Find the index of the updated contact
                    const index = roles.findIndex(item => item.id === id);

                    // Update the contact
                    roles[index] = rol;

                    // Update the contacts
                    this._roles.next(roles);

                    // Return the updated contact
                    return rol;
                }),
                switchMap(updatedRole => this.role$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._role.next(updatedRole);

                        // Return the updated contact
                        return updatedRole;
                    })
                ))
            ))
        );


        /*return from(this._httpClient.post('api/apps/claims-management/insertRol',rol)).pipe(
            switchMap((response: any) => {
                return of(response);
            })
        );*/
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
     * Add value
     *
     * @param value
     * @param id_settings
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
     * @param id_settings
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

    postTemplateFile(file){
        return this._httpClient.post('api/apps/claims-management/postTemplateFile', file).pipe(
            tap((files: any) => {
                return of(files);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    postContentsTemplate(contents, id){
        return from(this._apiErp.post('reclamo/Reclamo/postContentsTemplate',{
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

    /**
     * Delete value
     *
     * @param id_settings
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
     * Getter for tags
     */
    get tags$(): Observable<any[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Post Parameter
     *
     * @param parameter
     */
    postParameter(parameter, id_settings, status): Observable<any[]>
    {
        return this._httpClient.post('api/apps/claims-management/postParameter', {parameter,id_settings,status}).pipe(
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
     *
     * @param id_settings
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
}
