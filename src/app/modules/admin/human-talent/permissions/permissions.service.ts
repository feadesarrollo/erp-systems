import { Injectable } from '@angular/core';
import { ApiErpService } from "../../../../core/api-erp/api-erp.service";
import { HttpClient } from "@angular/common/http";
import { catchError, switchMap } from "rxjs/operators";
import { BobyMockApiUtils } from "../../../../../@boby/lib/mock-api";
import { assign, cloneDeep } from "lodash-es";
import { Observable, BehaviorSubject, of, from, take, map, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
    private _values: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _role: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _roles: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _countries: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _statusPermission: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _rolesByOfficial: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    constructor(private _apiErp:ApiErpService, private _httpClient: HttpClient) { }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for permission
     */
    get statusPermission$(): Observable<any>
    {
        return this._statusPermission.asObservable();
    }

    /**
     * Setter for permission
     */
    set statusPermission(value)
    {
        this._statusPermission.next(value);
    }

    /**
     * Get roles
     */
    getRoles(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/human-talent/getRoles').pipe(
            tap((roles: any) => {
                this._roles.next(JSON.parse(roles.datos[0].roles_list));
            })
        );
    }

    /**
     * Getter roles by official
     */
    get rolesByOfficial$(): Observable<any[]>
    {
        return this._rolesByOfficial.asObservable();
    }

    /**
     * Get roles by official
     */
    getRolesByOfficial(): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/HumanTalent/getRolesByOfficial',{})).pipe(
            switchMap((roles: any) => {
                const json_rol = JSON.parse(roles.datos[0].json_rol);
                // Return a new observable with the response
                this._rolesByOfficial.next(json_rol);
                return of(json_rol);
            }),
            catchError(error =>{
                return of(error);
            })

        );
    }

    /**
     * Get role by id
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
                    return throwError('No se pudo encontrar el rol con identificador ' + id + '!');
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
            id               : BobyMockApiUtils.guid(),
            name             : 'Nuevo Rol',
            officials        : [],
            permissionModule : [],
            notes            : ''
        };

        // Update the roles with the new role
        this._roles.next([newRole, ...this._roles.getValue()]);
        // Return the new role
        return of(newRole);
    }

    /**
     * Save Rol
     */
    saveRole(rol: any): Observable<any[]>
    {
        return from(this._httpClient.post('api/apps/human-talent/postRol',rol)).pipe(
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
        return this.roles$.pipe(
            take(1),
            switchMap(values => this._httpClient.delete('api/apps/claims-management/deleteRole', {params: {id_rol}}).pipe(
                map((isDeleted: any) => {

                    // Find the index of the deleted label within the labels
                    const index = values.findIndex(item => item.id_rol === id_rol);

                    // Delete the label
                    values.splice(index, 1);

                    // Update the labels
                    this._roles.next(values);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
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
     * Get module list
     *
     */
    getModuleList(code: string = ''):Observable<any[]>{


        return from(this._apiErp.post('organigrama/HumanTalent/getModuleList',{code})).pipe(
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
     * Setter & getter for user
     *
     * @param value
     */
    set role(value)
    {
        // Store the value
        this._role.next(value);
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
}
