import { Injectable } from '@angular/core';
import {catchError, switchMap} from "rxjs/operators";
import { Observable, BehaviorSubject, of, from, take, map, tap, filter, throwError } from "rxjs";
import {ApiErpService} from "../../../../../core/api-erp/api-erp.service";
import {HttpClient} from "@angular/common/http";
import {assign, cloneDeep} from "lodash-es";
import {BobyMockApiUtils} from "../../../../../../@boby/lib/mock-api";

@Injectable({
  providedIn: 'root'
})
export class GroupEmailsService {

    private _emails: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    //private _email: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set emails(value)
    {
        // Store the value
        this._emails.next(value);
    }

    get emails$(): Observable<any[]>
    {
        return this._emails.asObservable();
    }

    /**
     * Get group emails
     */
    getGroupEmails(): Observable<any[]>
    {
        return this._httpClient.get<any[]>('api/apps/claims-management/getGroupEmails').pipe(
            switchMap((groupEmails: any) => {
                return of(groupEmails);
            })
        );
    }

    /**
     * Post group emails
     *
     * @param classifier
     */
    postGroupEmails(classifier, id_classifiers, status): Observable<any[]>
    {
        return this._httpClient.post('api/apps/claims-management/postGroupEmails', {classifier,id_classifiers,status}).pipe(
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
     * @param id_classifiers
     */
    deleteGroupEmails(id_classifiers): Observable<any[]>
    {
        return this._httpClient.delete('api/apps/claims-management/deleteGroupEmails', {params: {id_classifiers}}).pipe(
            tap((params: any) => {
                return of(params);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }
    /**
     * Get group emails by id
     */
    /*getGroupEmailsById(id: string): Observable<any>
    {
        return this._emails.pipe(
            take(1),
            map((emails) => {

                // Find the contact
                const email = emails.find(item => item.id === id) || null;

                // Update the contact
                this._email.next(email);

                // Return the contact
                return email;
            }),
            switchMap((email) => {

                if ( !email )
                {
                    return throwError('Could not found contact with id of ' + id + '!');
                }

                return of(email);
            })
        );

    }*/


    /**
     * Add email
     *
     * @param value
     * @param id_classifiers
     */
    addEmail(value,id_classifiers): Observable<any>
    {

        const newValue = cloneDeep(value);
        newValue.id = BobyMockApiUtils.guid();

        newValue.slug = newValue.email.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[-]+/g, '-')
            .replace(/[^\w-]+/g, '');

        // Check if the slug is being used and update it if necessary
        const originalSlug = newValue.slug;

        let sameSlug;
        let slugSuffix = 1;

        do{
            sameSlug = this._emails.getValue().filter(item => item.slug === newValue.slug);

            if ( sameSlug.length > 0 )
            {
                newValue.slug = originalSlug + '-' + slugSuffix;
                slugSuffix++;
            }
        }
        while ( sameSlug.length > 0 );

        // Return the new value
        return this._httpClient.post('api/apps/claims-management/postEmail', {newValue, id_classifiers}).pipe(
            tap((value: any) => {
                this._emails.next([newValue, ...this._emails.getValue()]);

                return of(newValue);
            }),
            catchError(error =>{
                return of(error);
            })
        );
    }

    /**
     * Update value
     *
     * @param id_classifiers
     * @param id
     * @param value
     */
    updateEmail(id_classifiers, id, value: any): Observable<any>
    {
        let updatedValue = null;
        // Find the label and update it
        this._emails.getValue().forEach((item, index, labels) => {

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

        return this.emails$.pipe(
            take(1),
            switchMap(values => this._httpClient.patch<any>('api/apps/claims-management/patchEmail', {
                id_classifiers,
                id,
                updatedValue
            }).pipe(
                map((reponse: any) => {
                    // Find the index of the updated label within the labels
                    const index = values.findIndex(item => item.id === id);
                    // Update the label
                    values[index] = updatedValue;

                    // Update the labels
                    this._emails.next(values);

                    // Return the updated label
                    return reponse;
                })
            ))
        );
    }

    /**
     * Delete email
     *
     * @param id_classifiers
     * @param id
     */
    deleteEmail(id_classifiers, id): Observable<any>
    {
        return this.emails$.pipe(
            take(1),
            switchMap(values => this._httpClient.delete('api/apps/claims-management/deleteEmail', {params: {id_classifiers,id}}).pipe(
                map((isDeleted: any) => {

                    // Find the index of the deleted label within the labels
                    const index = values.findIndex(item => item.id === id);

                    // Delete the label
                    values.splice(index, 1);

                    // Update the labels
                    this._emails.next(values);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }
}
