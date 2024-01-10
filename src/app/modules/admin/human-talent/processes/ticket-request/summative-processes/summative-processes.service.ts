import { Injectable, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject, from, of, tap, filter, take, map, throwError } from "rxjs";
import { ApiErpService } from "../../../../../../core/api-erp/api-erp.service";
import { switchMap, catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SummativeProcessesService {

    private _summatives: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _summative: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _statusSummative: BehaviorSubject<any | null> = new BehaviorSubject('');

    public $emitter = new EventEmitter();

    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) { }

    emitirEvento() {
        this.$emitter.emit();
    }

    /**
     * Getter for summatives
     */
    get summatives$(): Observable<any[]>
    {
        return this._summatives.asObservable();
    }

    /**
     * Getter for summative
     */
    get summative$(): Observable<any>
    {
        return this._summative.asObservable();
    }

    /**
     * Getter for summative
     */
    set summative(summative)
    {
        this._summative.next(summative);
    }

    /**
     * Getter for summative
     */
    get statusSummative$(): Observable<any>
    {
        return this._statusSummative.asObservable();
    }

    /**
     * Getter for summative
     */
    set statusSummative(value)
    {
        this._statusSummative.next(value);
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter summative process
     */
    getSummativeProcess(start, limit):Observable<{ pagination: any; summatives: any[] }>{

        return from(this._httpClient.get<{ pagination: any; summatives: any[] }>('api/apps/human-talent/getSummativeProcess', {params: {start,limit}})).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._summatives.next(response.summatives);
            })
        );
    }

    /**
     * Get summative by id
     */
    getSummativeById(id: string): Observable<any>
    {
        return this.summatives$.pipe(
            take(1),
            map((summatives) => {
                // Find the contact
                const summative = summatives.find(item => item.id_summative_process === +id) || null;
                // Update the contact
                this._summative.next(summative);

                // Return the contact
                return summative;
            }),
            switchMap((summative) => {

                if ( !summative )
                {
                    return throwError('No se pudo encontrar el proceso sumario con ID ' + id + '!');
                }

                return of(summative);
            })
        );

    }

    /**
     * Post summative
     */
    postSummative(summative: any, statusSummative: string): Observable<any>
    {
        summative.statusSummative = statusSummative;

        const id = summative.id_summative_process;
        return this.summatives$.pipe(
            take(1),
            switchMap(summatives => this._httpClient.post('api/apps/human-talent/postSummativeProcess',summative).pipe(
                map((updatedSummative) => {
                    console.warn('1.- updatedSummative',updatedSummative);
                    // Find the index of the updated contact
                    const index = summatives.findIndex(item => item.id_summative_process === id);
                    // Update the contact
                    summatives[index] = summative;
                    if (statusSummative == 'new'){
                        this.statusSummative = 'edit';
                    }
                    // Update the contacts
                    this._summatives.next(summatives);

                    // Return the updated contact
                    return summative;
                }),
                switchMap(updatedSummative => this.summative$.pipe(
                    take(1),
                    filter(item => item && item.id_summative_process === id),
                    tap(() => {
                        console.warn('2.- updatedSummative',updatedSummative);
                        // Update the summative if it's selected
                        this._summative.next(updatedSummative);

                        // Return the updated summative
                        return updatedSummative;
                    })
                ))
            ))
        );
    }

    /**
     * Delete summative process
     */
    deleteSummativeProcess(id_summative_process: any): Observable<any[]>
    {
        /*return from(this._httpClient.post('api/apps/claims-management/deleteRole',rol))*/
        return from(this._httpClient.delete('api/apps/human-talent/deleteSummativeProcess', {params: {id_summative_process}})).pipe(
            switchMap((response: any) => {
                let summatives = this._summatives.getValue();
                // Find the index of the deleted contact
                const index = summatives.findIndex(item => item.id_summative_process === id_summative_process);
                // Delete the contact
                summatives.splice(index, 1);
                // Update the contacts
                this._summatives.next(summatives);
                return of(response);
            })
        );
    }

    /**
     * Create summative
     */
    createSummative(): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SummativeProcess/getSummativeId', {})).pipe(
            switchMap((resp: any) => {
                const newSummative = {
                    id_summative_process: +resp.data.id_summative_process,
                    id_funcionario: '',
                    start_date: '',
                    end_date: '',
                    summative_reason: ''
                };

                // Update the roles with the new role
                this._summatives.next([newSummative, ...this._summatives.getValue()]);
                // Return the new customer
                return of(newSummative);
            })
        );

    }

    /**
     * filter By Query
     */
    filterByQuery(start, limit, query): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/SummativeProcess/getSummativeProcess',{start, limit, query, par_filtro:'vf.desc_funcionario1#vf.desc_funcionario2#vf.ci'})).pipe(
            tap((response: any) => {

                const page = parseInt(start ?? '0', 10);
                const size = parseInt(limit ?? '10', 10);
                // Clone the products
                let summative: any[] | null = JSON.parse(response.datos[0].djson);
                // Paginate - Start
                const customersLength = summative.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), customersLength);
                const lastPage = Math.max(Math.ceil(customersLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // products but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage ) {
                    summative = null;
                    pagination = {
                        lastPage
                    };
                } else {
                    // Paginate the results by size
                    summative = summative.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : customersLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                // Return a success code along with some data
                this._pagination.next(pagination);
                this._summatives.next(summative);
            })
        );

    }
}
