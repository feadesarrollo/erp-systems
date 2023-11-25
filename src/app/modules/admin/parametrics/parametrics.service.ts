import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable, BehaviorSubject, of, forkJoin, from } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import * as moment from "moment";

import { ApiErpService } from '../../../core/api-erp/api-erp.service';
import {RateLanding} from "./parametrics.type";

@Injectable({
  providedIn: 'root'
})
export class ParametricsService {

    private _entitie$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _atoCategorie$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _aircraftWeight$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _rateLanding$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _rateSurchage$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _rateParking$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _parkingLanding$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _surchargeLanding$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private path:string;
    constructor(private _httpClient: HttpClient, private _apiErp:ApiErpService) { }

    private pathCurrency : string;
    private pathEntity : string;
    private pathCountry : string;
    private pathAtoCategory : string;
    private pathRateLanding : string;
    private pathAllAirports : string;
    private pathAirCraft : string;

    private pathParking : string;
    private pathSurcharge : string;

    private rateLanding: RateLanding;

    /******************************************************** Entity ********************************************************/

    /**
     * GET Entities
     */
    getEntities():Observable<{ pagination: any; entities: any[] }>{
        //this.path = 'http://172.17.58.46:3700/entity';
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'max-age=0'

            })
        };

        return this._httpClient.get(`${this.path}`,opciones).pipe(
            switchMap((response: any) => {
                // Get available queries
                const search = '';
                const sort = 'entityName';
                const order = 'asc';
                const page = 0 ;
                const size = 50;
                // Clone the records
                let entities: any[] | null =  response.result;
                // Sort the records
                if ( sort === 'entityName' )
                {
                    entities.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    entities.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = entities.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    entities = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    entities = entities.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }
                /*this._pagination.next(pagination);
                this._motivoAnulacion.next(response.datos);*/

                // Return a new observable with the response
                this._entitie$.next(entities);

                return of({entities,pagination});
            })
        );


    }

    /**
     * search entities
     * @param search
     */
    searchEntities(p_search = ''):Observable<{ pagination: any; entities: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'entityName';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let entities: any[] | null = this._entitie$.getValue();

        // Sort the records
        if ( sort === 'entityName' )
        {
            entities.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            entities.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            entities = entities.filter(ent => ent.entityName.toLowerCase().includes(search.toLowerCase())
                /*|| ent.code.toString().includes(search.toLowerCase())
                || ent.name.toString().includes(search.toLowerCase())
                || ent.detail.toLowerCase().includes(search.toLowerCase())*/
            );
        }

        // Paginate - Start
        const itemsLength = entities.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            entities = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            entities = entities.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }
        /*this._pagination.next(pagination);
        this._motivoAnulacion.next(motivos);*/

        return of({entities,pagination});
    }

    /**
     * POST Entity
     */
    postEntity(entity: any): Observable<any>
    {
        //this.path = 'http://172.17.58.46:3700/entity';
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/postEntity';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            startDate : moment(entity.startDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            endDate : moment(entity.endDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            countryId : entity.countryId,
            entityName : entity.entityName
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Entity
     */
    putEntity(entity: any): Observable<any>
    {
        //this.path = 'http://172.17.58.46:3700/entity';
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/putEntity';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.put(`${this.path}`, {
            id : entity.id,
            startDate : moment(entity.startDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            endDate : moment(entity.endDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            countryId : entity.countryId,
            entityName : entity.entityName
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete entity
     */
    deleteEntity(id: number): Observable<any>
    {
        //this.path = `http://172.17.58.46:3700/entity/${id}`;
        this.path = `https://apind.boa.bo/api/landing-nd/Landing/deleteEntity/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })/*,
            params: parametros*/
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Get All Contries
     */
    getAllContries(): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return this._httpClient.get(`${this.path}`, opciones).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /******************************************************** Entity ********************************************************/

    /******************************************************** Ato Categories ********************************************************/
    /**
     * GET Ato Categories
     */
    getAtoCategories():Observable<{ pagination: any; atoCategories: any[]; airports: any[]}>{

        //this.path = 'http://172.17.58.46:3700/ato-categories';
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';

        //this.pathAllAirports = 'http://172.17.58.46:3700/ato-categories/GetAllAirports';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.path}`),
            this._httpClient.get(`${this.pathAllAirports}`)
        ]).pipe(
            switchMap((data: any[]) => {

                let atoCategory = data[0].result;
                let airports = data[1].result;

                // Get available queries
                const search = '';
                const sort = 'categorie';
                const order = 'asc';
                const page = 0 ;
                const size = 50;

                atoCategory.map((cat)=>{
                    cat.startDate_yyyyMMdd = moment(cat.startDate_yyyyMMdd).format('YYYY-MM-DD');
                    cat.endDate_yyyyMMdd = moment(cat.endDate_yyyyMMdd).format('YYYY-MM-DD');
                });

                atoCategory.forEach(atoCategory =>{
                    let country = airports.find(item => item.aeropuertoID == atoCategory.atoId);
                    atoCategory.airPort = country.nombreEstacion;
                    atoCategory.codEstacion = country.codEstacion;
                });

                // Clone the records
                let atoCategories: any[] | null =  atoCategory;

                // Sort the records
                if ( sort === 'categorie' )
                {
                    atoCategories.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    atoCategories.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = atoCategories.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    atoCategories = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    atoCategories = atoCategories.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }


                // Return a new observable with the response
                this._atoCategorie$.next(atoCategories);

                return of({pagination,atoCategories,airports});
            })
        );


    }
    /**
     * search Ato Categories
     * @param search
     */
    searchAtoCategories(p_search = ''):Observable<{ pagination: any; atoCategories: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'categorie';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let atoCategories: any[] | null = this._atoCategorie$.getValue();

        // Sort the records
        if ( sort === 'categorie' )
        {
            atoCategories.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            atoCategories.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            atoCategories = atoCategories.filter(ato => ato.categorie.toLowerCase().includes(search.toLowerCase())
                || ato.airPort.toLowerCase().includes(search.toLowerCase())
                || ato.codEstacion.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = atoCategories.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            atoCategories = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            atoCategories = atoCategories.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }

        return of({atoCategories,pagination});
    }

    /**
     * POST Ato Category
     */
    postAtoCategory(atoCategory: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/postAtoCategory';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            startDate_yyyyMMdd : moment(atoCategory.startDate_yyyyMMdd).format('yyyyMMDD'),//YYYY-MM-DDTHH:mm:ss.SSS[Z]
            endDate_yyyyMMdd : moment(atoCategory.endDate_yyyyMMdd).format('yyyyMMDD'),
            categorie : atoCategory.categorie,
            atoId : atoCategory.atoId,

        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Ato Category
     */
    putAtoCategory(atoCategory: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/putAtoCategory';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this._httpClient.put(`${this.path}`, {
            id : atoCategory.id,
            startDate_yyyyMMdd : moment(atoCategory.startDate_yyyyMMdd).format('yyyyMMDD'),
            endDate_yyyyMMdd : moment(atoCategory.endDate_yyyyMMdd).format('yyyyMMDD'),
            categorie : atoCategory.categorie,
            atoId : atoCategory.atoId
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete Ato Category
     */
    deleteAtoCategory(id: number): Observable<any>
    {
        this.path = `https://apind.boa.bo/api/landing-nd/Landing/deleteAtoCategory/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Get All Airports
     */
    getAllAirports(): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return this._httpClient.get(`${this.path}`, opciones).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /******************************************************** Ato Categories ********************************************************/

    /******************************************************** Weight Aircraft ********************************************************/
    /**
     * GET Aircraft Weight
     */
    getAircraftWeight():Observable<{ pagination: any; aircraftWeight: any[]; airCraft: any[] }>{
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAircraftWeight';

        this.pathAirCraft = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAircraft';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.path}`),
            this._httpClient.get(`${this.pathAirCraft}`)
        ]).pipe(
            switchMap((data: any[]) => {

                let aWeight = data[0].result;
                let airCraft = data[1].result;

                // Get available queries
                const search = '';
                const sort = 'aircraft';
                const order = 'asc';
                const page = 0 ;
                const size = 50;

                aWeight.map((cat)=>{
                    cat.startDate_yyyyMMdd = moment(cat.startDate_yyyyMMdd).format('YYYY-MM-DD');
                    cat.endDate_yyyyMMdd = moment(cat.endDate_yyyyMMdd).format('YYYY-MM-DD');
                });

                aWeight.forEach(aircraftWeight =>{
                    let airship = airCraft.find(item => item.aeronaveid == aircraftWeight.aeronaveId);
                    aircraftWeight.aircraft = airship?.matricula ?? 'NO ESPECIFICA';
                    aircraftWeight.modelo = airship?.modelo ?? 'NO ESPECIFICA';
                });

                // Clone the records
                let aircraftWeight: any[] | null =  aWeight;

                // Sort the records
                if ( sort === 'aircraft' )
                {
                    aircraftWeight.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    aircraftWeight.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = aircraftWeight.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    aircraftWeight = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    aircraftWeight = aircraftWeight.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }

                // Return a new observable with the response
                this._aircraftWeight$.next(aircraftWeight);

                return of({pagination,aircraftWeight,airCraft});
            })
        );


    }
    /**
     * search Ato Categories
     * @param search
     */
    searchAircraftWeight(p_search = ''):Observable<{ pagination: any; aircraftWeight: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'aircraft';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let aircraftWeight: any[] | null = this._aircraftWeight$.getValue();

        // Sort the records
        if ( sort === 'aircraft' )
        {
            aircraftWeight.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            aircraftWeight.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            aircraftWeight = aircraftWeight.filter(aWeight =>
                aWeight.aircraft.toLowerCase().includes(search.toLowerCase())
                || aWeight.mtow.toString().includes(search.toLowerCase())
                || aWeight.modelo.toString().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = aircraftWeight.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            aircraftWeight = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            aircraftWeight = aircraftWeight.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }

        return of({aircraftWeight,pagination});
    }

    /**
     * POST Aircraft Weight
     */
    postAircraftWeight(aircraftWeight: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/postAircraftWeight';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            startDate_yyyyMMdd : moment(aircraftWeight.startDate_yyyyMMdd).format('yyyyMMDD'),//YYYY-MM-DDTHH:mm:ss.SSS[Z]
            endDate_yyyyMMdd : moment(aircraftWeight.endDate_yyyyMMdd).format('yyyyMMDD'),
            aeronaveId : aircraftWeight.aeronaveId,
            mtow : aircraftWeight.mtow,
            estado : 1,
            usrRegistro : aircraftWeight.usrRegistro
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Aircraft Weight
     */
    putAircraftWeight(aircraftWeight: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/putAircraftWeight';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        //console.warn('PUT',atoCategory);
        return this._httpClient.put(`${this.path}`, {
            id : aircraftWeight.id,
            startDate_yyyyMMdd : moment(aircraftWeight.startDate_yyyyMMdd).format('yyyyMMDD'),
            endDate_yyyyMMdd : moment(aircraftWeight.endDate_yyyyMMdd).format('yyyyMMDD'),
            aeronaveId : aircraftWeight.aeronaveId,
            mtow : aircraftWeight.mtow,
            estado : 1,
            usrRegistro : aircraftWeight.usrRegistro
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete Aircraft Weight
     */
    deleteAircraftWeight(id: number): Observable<any>
    {
        this.path = `https://apind.boa.bo/api/landing-nd/Landing/deleteAircraftWeight/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Get Aircraft
     */
    getAllAircraft(): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAircraft';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return this._httpClient.get(`${this.path}`, opciones).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /******************************************************** Weight Aircraft ********************************************************/

    /******************************************************** Rate Landing ********************************************************/

    /**
     * GET Rate Landing
     */
    getMatchRateLanding():Observable<{ pagination: any; rateLanding: any[]; currency:any[]; entity: any[],country: any[],atoCategory: any[] }>{

        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getAllRateLanding';

        this.pathCurrency = 'https://apind.boa.bo/api/landing-nd/Landing/getAllCurrencys';
        this.pathEntity = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        this.pathCountry = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';
        this.pathAtoCategory = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.path}`),
            this._httpClient.get(`${this.pathCurrency}`),
            this._httpClient.get(`${this.pathEntity}`),
            this._httpClient.get(`${this.pathCountry}`),
            this._httpClient.get(`${this.pathAtoCategory}`),
            this._httpClient.get(`${this.pathAllAirports}`)
        ]).pipe(
            map((data: any[]) => {

                let matchRateLanding = data[0].result;
                let currency = data[1].result;
                let entity = data[2].result;
                let country = data[3].result;
                let atoCategory = data[4].result;
                let airports = data[5].result;

                console.warn('matchRateLanding',matchRateLanding);
                console.warn('currency',currency);
                console.warn('entity',entity);
                console.warn('country',country);
                console.warn('atoCategory',atoCategory);
                console.warn('airports',airports);

                matchRateLanding.forEach(item => {
                   let filterCurrency = currency.find( c => c.monedaID == item.monedaId);
                    item.currency = filterCurrency.nombre;
                });
                matchRateLanding.forEach(item => {
                    let filterCountry = country.find( c => c.paisID == item.paisId);
                    item.country = filterCountry.nombrePis;
                });
                matchRateLanding.forEach(item => {
                    let filterEntity = entity.find( c => c.id == item.entidadId);
                    item.entity = filterEntity.entityName;
                });
                matchRateLanding.forEach(item => {
                    let filterCateryAto = atoCategory.find( c => c.id == item.categoriaAtoId);
                    let filterAto = airports.find( air => air.aeropuertoID == filterCateryAto.atoId);

                    item.categoryAto = `${filterCateryAto.categorie} - ${filterAto.nombreEstacion} (${filterAto.codEstacion})`;
                    item.categorie = filterCateryAto.categorie;
                    item.nombreEstacion = filterAto.nombreEstacion;
                    item.codEstacion = filterAto.codEstacion;
                });
                atoCategory.forEach(item => {
                    let filterAirport = airports.find( air => air.aeropuertoID == item.atoId);
                    item.description = `${item.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;
                });

                // Get available queries
                const search = '';
                const sort = 'servicio';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;

                matchRateLanding.map((cat)=>{
                    cat.startDate_yyyyMMdd = moment(cat.startDate_yyyyMMdd).format('YYYY-MM-DD');
                    cat.endDate_yyyyMMdd = moment(cat.endDate_yyyyMMdd).format('YYYY-MM-DD');
                });

                // Clone the records
                let rateLanding: any[] | null =  matchRateLanding;

                // Sort the records
                if ( sort === 'servicio' )
                {
                    rateLanding.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    rateLanding.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = rateLanding.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    rateLanding = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    rateLanding = rateLanding.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }


                // Return a new observable with the response
                this._rateLanding$.next(rateLanding);
                return {pagination,rateLanding,currency,entity,country,atoCategory};
            })
        );
    }

    /**
     * GET Parking Surcharges
     */
    getParkingSurcharge(rateLanding: RateLanding):Observable<{ paginationParking: any; parkingLanding: any[]; paginationSurcharge:any; surchargeLanding: any[]}>{


        this.pathParking = 'https://apind.boa.bo/api/landing-nd/Landing/getAllRateParking';
        this.pathSurcharge = 'https://apind.boa.bo/api/landing-nd/Landing/getRateSurcharges';

        this.pathCurrency = 'https://apind.boa.bo/api/landing-nd/Landing/getAllCurrencys';
        this.pathEntity = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        this.pathCountry = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';
        this.pathAtoCategory = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';

        this.rateLanding = rateLanding;
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.pathParking}`,opciones),
            this._httpClient.get(`${this.pathSurcharge}`,opciones),

            this._httpClient.get(`${this.pathCurrency}`,opciones),
            this._httpClient.get(`${this.pathEntity}`,opciones),
            this._httpClient.get(`${this.pathCountry}`,opciones),
            this._httpClient.get(`${this.pathAtoCategory}`,opciones),
            this._httpClient.get(`${this.pathAllAirports}`,opciones)
        ]).pipe(
            map((data: any[]) => {

                let parking = data[0].result;
                let surcharge = data[1].result;

                let currency = data[2].result;
                let entity = data[3].result;
                let country = data[4].result;
                let atoCategory = data[5].result;
                let airports = data[6].result;

                let filterCurrency;
                let filterCountry;
                let filterEntity;
                let filterCategoryAto;
                let filterAirport;

                filterCurrency = currency.find(c => c.monedaID == this.rateLanding.monedaId);
                filterCountry = country.find(c => c.paisID == this.rateLanding.paisId);
                filterEntity = entity.find(c => c.id == this.rateLanding.entidadId);
                filterCategoryAto = atoCategory.find(c => c.id == this.rateLanding.categoriaAtoId);
                filterAirport = airports.find( air => air.aeropuertoID == filterCategoryAto.atoId);

                parking.forEach(rs => {
                    rs.currency = filterCurrency.nombre;
                    rs.tipoTrafico = this.rateLanding.tipoTrafico;
                    rs.pesoMinimo = this.rateLanding.pesoMinimo;
                    rs.pesoMaximo = this.rateLanding.pesoMaximo;
                    rs.nombreEstacion = filterAirport.nombreEstacion;
                    rs.categorie = filterCategoryAto.categorie;
                    rs.codEstacion = filterAirport.codEstacion;
                });

                parking =  parking.filter(item => item.tarifaAterrizajeId === this.rateLanding.id);

                surcharge.forEach(rs => {
                    rs.currency = filterCurrency.nombre;
                    rs.tipoTrafico = this.rateLanding.tipoTrafico;
                    rs.pesoMinimo = this.rateLanding.pesoMinimo;
                    rs.pesoMaximo = this.rateLanding.pesoMaximo;
                    rs.nombreEstacion = filterAirport.nombreEstacion;
                    rs.categorie = filterCategoryAto.categorie;
                    rs.codEstacion = filterAirport.codEstacion;
                });

                surcharge =  surcharge.filter(item => item.tarifaAterrizajeId === this.rateLanding.id);

                // Get available queries
                const search = '';
                const sort = 'codEstacion';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;

                parking.map((cat)=>{
                    cat.startDate_yyyyMMdd = moment(cat.startDate_yyyyMMdd).format('YYYY-MM-DD');
                    cat.endDate_yyyyMMdd = moment(cat.endDate_yyyyMMdd).format('YYYY-MM-DD');
                });

                /************************************************ PARKING ************************************************/
                // Result the parking
                let parkingLanding: any[] | null =  parking;
                // Sort the parkingLanding
                if ( sort === 'codEstacion' )
                {
                    parkingLanding.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    parkingLanding.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLengthP = parkingLanding.length;

                // Calculate pagination details
                const beginP = page * size;
                const endP = Math.min((size * (page + 1)), itemsLengthP);
                const lastPageP = Math.max(Math.ceil(itemsLengthP / size), 1);

                // Prepare the pagination object
                let paginationParking = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPageP )
                {
                    parkingLanding = null;
                    paginationParking = {
                        lastPageP
                    };
                }
                else
                {
                    // Paginate the results by size
                    parkingLanding = parkingLanding.slice(beginP, endP);

                    // Prepare the pagination mock-api
                    paginationParking = {
                        length    : itemsLengthP,
                        size      : size,
                        page      : page,
                        lastPage  : lastPageP,
                        startIndex: beginP,
                        endIndex  : endP - 1
                    };
                }
                // Return a new observable with the response
                this._parkingLanding$.next(parkingLanding);
                /************************************************ PARKING ************************************************/

                /************************************************ SURCHARGE ************************************************/
                // Result the surcharge
                let surchargeLanding: any[] | null =  surcharge;

                // Sort the surchargeLanding
                if ( sort === 'codEstacion' )
                {
                    surchargeLanding.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    surchargeLanding.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLengthS = surchargeLanding.length;

                // Calculate pagination details
                const beginS = page * size;
                const endS = Math.min((size * (page + 1)), itemsLengthS);
                const lastPageS = Math.max(Math.ceil(itemsLengthS / size), 1);

                // Prepare the pagination object
                let paginationSurcharge = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPageS )
                {
                    surchargeLanding = null;
                    paginationParking = {
                        lastPageS
                    };
                }
                else
                {
                    // Paginate the results by size
                    surchargeLanding = surchargeLanding.slice(beginS, endS);

                    // Prepare the pagination mock-api
                    paginationSurcharge = {
                        length    : itemsLengthS,
                        size      : size,
                        page      : page,
                        lastPage  : lastPageS,
                        startIndex: beginS,
                        endIndex  : endS - 1
                    };
                }
                // Return a new observable with the response
                this._surchargeLanding$.next(surchargeLanding);
                /************************************************ SURCHARGE ************************************************/

                return {paginationParking,parkingLanding,paginationSurcharge,surchargeLanding};
            })
        );
    }

    /**
     * search Rate Landing
     * @param search
     */
    searchRateLanding(p_search = ''):Observable<{ pagination: any; rateLanding: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'servicio';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let rateLanding: any[] | null = this._rateLanding$.getValue();

        // Sort the records
        if ( sort === 'servicio' )
        {
            rateLanding.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            rateLanding.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            rateLanding = rateLanding.filter(rl =>
                rl.entity.toLowerCase().includes(search.toLowerCase())
                || rl.categorie.toLowerCase().includes(search.toLowerCase())
                || rl.codEstacion.toLowerCase().includes(search.toLowerCase())
                || rl.country.toLowerCase().includes(search.toLowerCase())
                || rl.currency.toLowerCase().includes(search.toLowerCase())
                || rl.nombreEstacion.toLowerCase().includes(search.toLowerCase())
                || rl.pesoMinimo.toString().includes(search.toLowerCase())
                || rl.pesoMaximo.toString().includes(search.toLowerCase())
                || rl.servicio.toLowerCase().includes(search.toLowerCase())
                || rl.tipoTrafico.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = rateLanding.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            rateLanding = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            rateLanding = rateLanding.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }

        return of({rateLanding,pagination});
    }

    /**
     * POST Rate Landing
     */
    postRateLanding(rateLanding: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/postRateLanding';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            startDate_yyyyMMdd : moment(rateLanding.startDate_yyyyMMdd).format('yyyyMMDD'),//YYYY-MM-DDTHH:mm:ss.SSS[Z]
            endDate_yyyyMMdd : moment(rateLanding.endDate_yyyyMMdd).format('yyyyMMDD'),

            paisId : rateLanding.paisId,
            entidadId : rateLanding.entidadId,
            categoriaAtoId : rateLanding.categoriaAtoId,
            servicio : rateLanding.servicio,
            tipoTrafico : rateLanding.tipoTrafico,
            pesoMinimo : rateLanding.pesoMinimo,
            pesoMaximo : rateLanding.pesoMaximo,
            tarifa : rateLanding.tarifa,
            monedaId : rateLanding.monedaId
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Rate Landing
     */
    putRateLanding(rateLanding: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/putRateLanding';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this._httpClient.put(`${this.path}`, {
            id : rateLanding.id,
            startDate_yyyyMMdd : moment(rateLanding.startDate_yyyyMMdd).format('yyyyMMDD'),
            endDate_yyyyMMdd : moment(rateLanding.endDate_yyyyMMdd).format('yyyyMMDD'),

            paisId : rateLanding.paisId,
            entidadId : rateLanding.entidadId,
            categoriaAtoId : rateLanding.categoriaAtoId,
            servicio : rateLanding.servicio,
            tipoTrafico : rateLanding.tipoTrafico,
            pesoMinimo : rateLanding.pesoMinimo,
            pesoMaximo : rateLanding.pesoMaximo,
            tarifa : rateLanding.tarifa,
            monedaId : rateLanding.monedaId
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete Rate Landing
     */
    deleteRateLanding(id: number): Observable<any>
    {
        this.path = `https://apind.boa.bo/api/landing-nd/Landing/deleteRateLanding/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /******************************************************** Rate Landing ********************************************************/

    /******************************************************** Rate Surcharges ********************************************************/

    getAllRateSurcharge():Observable<{ pagination: any; rateSurcharge: any[]; rateLanding : any[]}>{

        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getRateSurcharges';
        this.pathRateLanding = 'https://apind.boa.bo/api/landing-nd/Landing/getAllRateLanding';
        this.pathCurrency = 'https://apind.boa.bo/api/landing-nd/Landing/getAllCurrencys';
        this.pathEntity = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        this.pathCountry = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';
        this.pathAtoCategory = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.path}`),
            this._httpClient.get(`${this.pathRateLanding}`),
            this._httpClient.get(`${this.pathCurrency}`),
            this._httpClient.get(`${this.pathEntity}`),
            this._httpClient.get(`${this.pathCountry}`),
            this._httpClient.get(`${this.pathAtoCategory}`),
            this._httpClient.get(`${this.pathAllAirports}`)
        ]).pipe(
            map((data: any[]) => {

                let rateSurcharges = data[0].result;
                let rateLanding = data[1].result;
                let currency = data[2].result;
                let entity = data[3].result;
                let country = data[4].result;
                let atoCategory = data[5].result;
                let airports = data[6].result;

                console.warn('rateSurcharges',rateSurcharges);
                console.warn('rateLanding',rateLanding);
                console.warn('currency',currency);
                console.warn('entity',entity);
                console.warn('country',country);
                console.warn('atoCategory',atoCategory);
                console.warn('airports',airports);

                let filterRateLanding;
                let filterCurrency;
                let filterCountry;
                let filterEntity;
                let filterCategoryAto;
                let filterAirport;

                rateSurcharges.forEach(rs => {

                    filterRateLanding = rateLanding.find(rl => rl.id == rs.tarifaAterrizajeId);

                    filterCurrency = currency.find(c => c.monedaID == filterRateLanding.monedaId);
                    filterRateLanding.currency = filterCurrency.nombre;

                    filterCountry = country.find(c => c.paisID == filterRateLanding.paisId);
                    filterRateLanding.country = filterCountry.nombrePis;

                    filterEntity = entity.find(c => c.id == filterRateLanding.entidadId);
                    filterRateLanding.entity = filterEntity.entityName;

                    filterCategoryAto = atoCategory.find(c => c.id == filterRateLanding.categoriaAtoId);
                    filterRateLanding.categoryAto = filterCategoryAto.categorie;

                    filterAirport = airports.find( air => air.aeropuertoID == filterCategoryAto.atoId);
                    filterRateLanding.descriptionAto = `${filterCategoryAto.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;

                    rs.rateLanding = `${filterRateLanding.descriptionAto} ${filterRateLanding.tipoTrafico} ${filterRateLanding.pesoMinimo} ${filterRateLanding.pesoMaximo} ${filterRateLanding.currency}`;

                    rs.descriptionAto = filterRateLanding.descriptionAto;
                    rs.currency = filterRateLanding.currency;
                    rs.tipoTrafico = filterRateLanding.tipoTrafico;
                    rs.pesoMinimo = filterRateLanding.pesoMinimo;
                    rs.pesoMaximo = filterRateLanding.pesoMaximo;

                    rs.nombreEstacion = filterAirport.nombreEstacion;
                    rs.categorie = filterCategoryAto.categorie;
                    rs.codEstacion = filterAirport.codEstacion;
                });

                rateLanding.forEach(item => {
                    let filterCurrency = currency.find( c => c.monedaID == item.monedaId);
                    item.currency = filterCurrency.nombre;
                });

                rateLanding.forEach(item => {
                    let filterCountry = country.find( c => c.paisID == item.paisId);
                    item.country = filterCountry.nombrePis;
                });
                rateLanding.forEach(item => {
                    let filterEntity = entity.find( c => c.id == item.entidadId);
                    item.entity = filterEntity.entityName;
                });
                rateLanding.forEach(item => {
                    let filterCateryAto = atoCategory.find( c => c.id == item.categoriaAtoId);
                    filterAirport = airports.find( air => air.aeropuertoID == filterCateryAto.atoId);
                    let descriptionAto = `${filterCateryAto.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;
                    //item.rateLanding = `${item.country} ${item.entity} ${descriptionAto} ${item.servicio} ${item.tarifa} ${item.currency}`;
                    item.rateLanding = `${descriptionAto} ${item.tipoTrafico} ${item.pesoMinimo} ${item.pesoMaximo} ${item.currency}`;
                    item.categoryAto = filterCateryAto.categorie;
                    item.nombreEstacion = filterAirport.nombreEstacion;
                    item.codEstacion = filterAirport.codEstacion;
                });

                // Get available queries
                const search = '';
                const sort = 'codEstacion';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;

                rateSurcharges.map((cat)=>{
                    cat.startHr = cat.startHr != '' ? cat.startHr.substring(0,5) : '00:00';
                    cat.endHr = cat.endHr != '' ? cat.endHr.substring(0,5) : '00:00';
                });
                // Clone the records
                let rateSurcharge: any[] | null =  rateSurcharges;

                // Sort the records
                if ( sort === 'codEstacion' )
                {
                    rateSurcharge.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    rateSurcharge.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = rateSurcharge.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    rateSurcharge = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    rateSurcharge = rateSurcharge.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }


                // Return a new observable with the response
                this._rateSurchage$.next(rateSurcharge);

                return {pagination,rateSurcharge,rateLanding};
            })
        );
    }

    /**
     * search Rate Surcharge
     * @param search
     */
    searchRateSurcharge(p_search = ''):Observable<{ pagination: any; rateSurcharge: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'codEstacion';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let rateSurcharge: any[] | null = this._rateSurchage$.getValue();

        // Sort the records
        if ( sort === 'codEstacion' )
        {
            rateSurcharge.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            rateSurcharge.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            rateSurcharge = rateSurcharge.filter(surch =>
                surch.categorie.toLowerCase().includes(search.toLowerCase())
                || surch.codEstacion.toLowerCase().includes(search.toLowerCase())
                || surch.currency.toLowerCase().includes(search.toLowerCase())
                || surch.descriptionAto.toLowerCase().includes(search.toLowerCase())
                || surch.fromula.toLowerCase().includes(search.toLowerCase())
                || surch.nombreEstacion.toLowerCase().includes(search.toLowerCase())

                || surch.pesoMinimo.toString().includes(search.toLowerCase())
                || surch.pesoMaximo.toString().includes(search.toLowerCase())
                || surch.porcentaje.toString().includes(search.toLowerCase())
                || surch.rateLanding.toLowerCase().includes(search.toLowerCase())
                || surch.servicio.toLowerCase().includes(search.toLowerCase())
                || surch.tipoTrafico.toLowerCase().includes(search.toLowerCase())
                || surch.tarifaDomingo.toString().includes(search.toLowerCase())
                || surch.tarifaFeriado.toString().includes(search.toLowerCase())
                || surch.tarifaSemana.toString().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = rateSurcharge.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            rateSurcharge = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            rateSurcharge = rateSurcharge.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }

        return of({rateSurcharge,pagination});
    }

    /**
     * POST Rate Surcharge
     */
    postRateSurcharge(rateSurcharge: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/postRateSurcharges';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            tarifaDomingo : rateSurcharge.tarifaDomingo,
            tarifaFeriado : rateSurcharge.tarifaFeriado,
            tarifaSemana : rateSurcharge.tarifaSemana,
            servicio : rateSurcharge.servicio,
            tarifaAterrizajeId : rateSurcharge.tarifaAterrizajeId,
            porcentaje : rateSurcharge.porcentaje,
            fromula : rateSurcharge.fromula,
            startHr: rateSurcharge.startHr,
            endHr: rateSurcharge.endHr
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Rate Surcharge
     */
    putRateSurcharge(rateSurcharge: any): Observable<any>
    {
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/putRateSurcharges';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this._httpClient.put(`${this.path}`, {
            id : rateSurcharge.id,
            tarifaDomingo : rateSurcharge.tarifaDomingo,
            tarifaFeriado : rateSurcharge.tarifaFeriado,
            tarifaSemana : rateSurcharge.tarifaSemana,
            servicio : rateSurcharge.servicio,
            tarifaAterrizajeId : rateSurcharge.tarifaAterrizajeId,
            porcentaje : rateSurcharge.porcentaje,
            fromula : rateSurcharge.fromula,
            startHr: rateSurcharge.startHr,
            endHr: rateSurcharge.endHr
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete Rate Surcharge
     */
    deleteRateSurcharge(id: number): Observable<any>
    {
        this.path = `https://apind.boa.bo/api/landing-nd/Landing/deleteRateSurcharges/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /******************************************************** Rate Surcharges ********************************************************/

    /******************************************************** Rate Parking ********************************************************/

    getAllRateParking():Observable<{ pagination: any; rateParking: any[]; rateLanding : any[]}>{

        this.path ='https://apind.boa.bo/api/landing-nd/Landing/getAllRateParking';
        this.pathRateLanding = 'https://apind.boa.bo/api/landing-nd/Landing/getAllRateLanding';
        this.pathCurrency = 'https://apind.boa.bo/api/landing-nd/Landing/getAllCurrencys';
        this.pathEntity = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        this.pathCountry = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';
        this.pathAtoCategory = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
                'Access-Control-Allow-Origin': '*'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.path}`),
            this._httpClient.get(`${this.pathRateLanding}`),
            this._httpClient.get(`${this.pathCurrency}`),
            this._httpClient.get(`${this.pathEntity}`),
            this._httpClient.get(`${this.pathCountry}`),
            this._httpClient.get(`${this.pathAtoCategory}`),
            this._httpClient.get(`${this.pathAllAirports}`)
        ]).pipe(
            map((data: any[]) => {

                let allRateParking = data[0].result;
                let rateLanding = data[1].result;
                let currency = data[2].result;
                let entity = data[3].result;
                let country = data[4].result;
                let atoCategory = data[5].result;
                let airports = data[6].result;

                let filterRateLanding;
                let filterCurrency;
                let filterCountry;
                let filterEntity;
                let filterCategoryAto;
                let filterAirport;

                allRateParking.forEach(rs => {

                    filterRateLanding = rateLanding.find(rl => rl.id == rs.tarifaAterrizajeId);

                    filterCurrency = currency.find(c => c.monedaID == filterRateLanding.monedaId);
                    filterRateLanding.currency = filterCurrency.nombre;

                    filterCountry = country.find(c => c.paisID == filterRateLanding.paisId);
                    filterRateLanding.country = filterCountry.nombrePis;

                    filterEntity = entity.find(c => c.id == filterRateLanding.entidadId);
                    filterRateLanding.entity = filterEntity.entityName;

                    filterCategoryAto = atoCategory.find(c => c.id == filterRateLanding.categoriaAtoId);
                    filterRateLanding.categoryAto = filterCategoryAto.categorie;

                    filterAirport = airports.find( air => air.aeropuertoID == filterCategoryAto.atoId);
                    filterRateLanding.descriptionAto = `${filterCategoryAto.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;

                    rs.rateLanding = `${filterRateLanding.descriptionAto} ${filterRateLanding.tipoTrafico} ${filterRateLanding.pesoMinimo} ${filterRateLanding.pesoMaximo} ${filterRateLanding.currency}`;
                    rs.descriptionAto = filterRateLanding.descriptionAto;
                    rs.currency = filterRateLanding.currency;
                    rs.tipoTrafico = filterRateLanding.tipoTrafico;
                    rs.pesoMinimo = filterRateLanding.pesoMinimo;
                    rs.pesoMaximo = filterRateLanding.pesoMaximo;

                    rs.nombreEstacion = filterAirport.nombreEstacion;
                    rs.categorie = filterCategoryAto.categorie;
                    rs.codEstacion = filterAirport.codEstacion;
                });

                rateLanding.forEach(item => {
                    let filterCurrency = currency.find( c => c.monedaID == item.monedaId);
                    item.currency = filterCurrency.nombre;
                });

                rateLanding.forEach(item => {
                    let filterCountry = country.find( c => c.paisID == item.paisId);
                    item.country = filterCountry.nombrePis;
                });
                rateLanding.forEach(item => {
                    let filterEntity = entity.find( c => c.id == item.entidadId);
                    item.entity = filterEntity.entityName;
                });
                rateLanding.forEach(item => {
                    let filterCateryAto = atoCategory.find( c => c.id == item.categoriaAtoId);
                    filterAirport = airports.find( air => air.aeropuertoID == filterCateryAto.atoId);
                    let descriptionAto = `${filterCateryAto.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;
                    //item.rateLanding = `${item.country} ${item.entity} ${descriptionAto} ${item.servicio} ${item.tarifa} ${item.currency}`;
                    item.rateLanding = `${descriptionAto} ${item.tipoTrafico} ${item.pesoMinimo} ${item.pesoMaximo} ${item.currency}`;
                    item.categoryAto = filterCateryAto.categorie;
                    item.nombreEstacion = filterAirport.nombreEstacion;
                    item.codEstacion = filterAirport.codEstacion;
                });

                // Get available queries
                const search = '';
                const sort = 'codEstacion';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;

                allRateParking.map((cat)=>{
                    cat.startDate_yyyyMMdd = moment(cat.startDate_yyyyMMdd).format('YYYY-MM-DD');
                    cat.endDate_yyyyMMdd = moment(cat.endDate_yyyyMMdd).format('YYYY-MM-DD');
                });

                // Clone the records
                let rateParking: any[] | null =  allRateParking;

                // Sort the records
                if ( sort === 'codEstacion' )
                {
                    rateParking.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    rateParking.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = rateParking.length;

                // Calculate pagination details
                const begin = page * size;
                const end = Math.min((size * (page + 1)), itemsLength);
                const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                // Prepare the pagination object
                let pagination = {};

                // If the requested page number is bigger than
                // the last possible page number, return null for
                // records but also send the last possible page so
                // the app can navigate to there
                if ( page > lastPage )
                {
                    rateParking = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    rateParking = rateParking.slice(begin, end);

                    // Prepare the pagination mock-api
                    pagination = {
                        length    : itemsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                }


                // Return a new observable with the response
                this._rateParking$.next(rateParking);

                return {pagination,rateParking,rateLanding};
            })
        );
    }

    /**
     * search Rate Surcharge
     * @param search
     */
    searchRateParking(p_search = ''):Observable<{ pagination: any; rateParking: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'codEstacion';
        const order = 'asc';
        const page = 0 ;
        const size = 100;
        // Clone the records
        let rateParking: any[] | null = this._rateParking$.getValue();

        // Sort the records
        if ( sort === 'codEstacion' )
        {
            rateParking.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            rateParking.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            rateParking = rateParking.filter(parking =>
                parking.categorie.toLowerCase().includes(search.toLowerCase())
                || parking.codEstacion.toLowerCase().includes(search.toLowerCase())
                || parking.currency.toLowerCase().includes(search.toLowerCase())
                || parking.descriptionAto.toLowerCase().includes(search.toLowerCase())

                || parking.fromula.toLowerCase().includes(search.toLowerCase())
                || parking.nombreEstacion.toLowerCase().includes(search.toLowerCase())
                || parking.pesoMinimo.toString().includes(search.toLowerCase())
                || parking.pesoMaximo.toString().includes(search.toLowerCase())
                || parking.porcentaje.toString().includes(search.toLowerCase())
                || parking.minSinCosto.toString().includes(search.toLowerCase())
                || parking.hrsEstacionamiento.toString().includes(search.toLowerCase())
                || parking.tipoTrafico.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = rateParking.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), itemsLength);
        const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

        // Prepare the pagination object
        let pagination = {};

        // If the requested page number is bigger than
        // the last possible page number, return null for
        // records but also send the last possible page so
        // the app can navigate to there
        if ( page > lastPage )
        {
            rateParking = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            rateParking = rateParking.slice(begin, end);

            // Prepare the pagination mock-api
            pagination = {
                length    : itemsLength,
                size      : size,
                page      : page,
                lastPage  : lastPage,
                startIndex: begin,
                endIndex  : end - 1
            };
        }

        return of({rateParking,pagination});
    }

    /**
     * POST Rate Parking
     */
    postRateParking(rateParking: any): Observable<any>
    {
        this.path ='https://apind.boa.bo/api/landing-nd/Landing/postRateParking';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`, {
            id : 0,
            startDate_yyyyMMdd : moment(rateParking.startDate_yyyyMMdd).format('yyyyMMDD'),//YYYY-MM-DDTHH:mm:ss.SSS[Z]
            endDate_yyyyMMdd : moment(rateParking.endDate_yyyyMMdd).format('yyyyMMDD'),

            minSinCosto : rateParking.minSinCosto,
            hrsEstacionamiento : rateParking.hrsEstacionamiento,
            tarifaAterrizajeId : rateParking.tarifaAterrizajeId,
            porcentaje : rateParking.porcentaje,
            fromula : rateParking.fromula
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * PUT Rate Parking
     */
    putRateParking(rateParking: any): Observable<any>
    {
        this.path ='https://apind.boa.bo/api/landing-nd/Landing/putRateParking';
        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.put(`${this.path}`, {
            id : rateParking.id,
            startDate_yyyyMMdd : moment(rateParking.startDate_yyyyMMdd).format('yyyyMMDD'),
            endDate_yyyyMMdd : moment(rateParking.endDate_yyyyMMdd).format('yyyyMMDD'),

            minSinCosto : rateParking.minSinCosto,
            hrsEstacionamiento : rateParking.hrsEstacionamiento,
            tarifaAterrizajeId : rateParking.tarifaAterrizajeId,
            porcentaje : rateParking.porcentaje,
            fromula : rateParking.fromula
        }, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * Delete Rate Parking
     */
    deleteRateParking(id: number): Observable<any>
    {
        this.path =`https://apind.boa.bo/api/landing-nd/Landing/deleteRateParking/${id}`;
        const opciones = {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        };
        return this._httpClient.delete(`${this.path}`, opciones ).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }
    /******************************************************** Rate Parking ********************************************************/
}
