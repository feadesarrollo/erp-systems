import { Injectable } from '@angular/core';

import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import { Observable, BehaviorSubject, of, forkJoin, from } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import * as moment from "moment";
import {trim} from "lodash-es";
import {ApiErpService} from "../../../core/api-erp/api-erp.service";


@Injectable({
  providedIn: 'root'
})
export class LandingParkingService {

    private path:string;
    private _landingData$: BehaviorSubject<any[] | null> = new BehaviorSubject([]);
    private _parkingData$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _landingFee$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private pathCurrency : string;
    private pathEntity : string;
    private pathCountry : string;
    private pathAtoCategory : string;
    private pathRateLanding : string;
    private pathAllAirports : string;
    private pathLanding : string;

    constructor(
        private _httpClient: HttpClient,
        private _apiErp:ApiErpService
    ) { }

    /**
     * GET Landing Data
     */
    loadLandingData(filter: any):Observable<{ pagination: any; landingData: any[]; response: any}>{
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getLandingData';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this._httpClient.post(`${this.path}`,filter,opciones).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'matricula';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;
                // Prepare the pagination object
                let pagination = {};

                // Clone the records
                let landingData: any[] | null =  response.result;
                if (landingData) {
                    // Sort the records
                    if (sort === 'matricula') {
                        landingData.sort((a, b) => {
                            const fieldA = a[sort].toString().toUpperCase();
                            const fieldB = b[sort].toString().toUpperCase();
                            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                        });
                    } else {
                        landingData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                    }

                    // Paginate - Start
                    const itemsLength = landingData.length;

                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), itemsLength);
                    const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                    // If the requested page number is bigger than
                    // the last possible page number, return null for
                    // records but also send the last possible page so
                    // the app can navigate to there
                    if (page > lastPage) {
                        landingData = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        landingData = landingData.slice(begin, end);

                        // Prepare the pagination mock-api
                        pagination = {
                            length: itemsLength,
                            size: size,
                            page: page,
                            lastPage: lastPage,
                            startIndex: begin,
                            endIndex: end - 1
                        };
                    }

                    // Return a new observable with the response
                    this._landingData$.next(landingData);
                }
                return of({pagination,landingData, response});
            })
        );
    }

    /**
     * Getter for items
     */
    get landingData$(): Observable<any[]>
    {
        return this._landingData$.asObservable();
    }

    /**
     * SEARCH Landing Data
     */
    searchLandingData(p_search = ''):Observable<{ pagination: any; landingData: any[]; }>{

                // Get available queries
                const search = p_search;
                const sort = 'matricula';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;


                // Clone the records
                let landingData: any[] | null =  this._landingData$.getValue();

                // Sort the records
                if ( sort === 'matricula' )
                {
                    landingData.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    landingData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // If search exists...
                if ( search )
                {
                    // Filter the records
                    landingData = landingData.filter(ld => ld.matricula?.toLowerCase().includes(search.toLowerCase())
                        || ld.mtow?.toString().includes(search.toLowerCase())
                        || ld.atoOACILlegada?.toLowerCase().includes(search.toLowerCase())
                        || ld.atoLlegada?.toLowerCase().includes(search.toLowerCase())
                        || ld.rutaLlegada?.toLowerCase().includes(search.toLowerCase())
                        || ld.tipoTrafico?.toLowerCase().includes(search.toLowerCase())
                        || ld.nroVueloLlegada?.toString().includes(search.toLowerCase())
                        || ld.importeAterrizaje?.toString().includes(search.toLowerCase())
                        || ld.obsAterrizaje?.toLowerCase().includes(search.toLowerCase())
                        || ld.estadoDes?.toLowerCase().includes(search.toLowerCase())
                        || ld.estado?.toString().includes(search.toLowerCase())
                    );
                }

                // Paginate - Start
                const itemsLength = landingData.length;

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
                    landingData = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    landingData = landingData.slice(begin, end);

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
                return of({pagination,landingData});
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

    /**
     * GET Parking Data
     */
    loadParkingData(filter: any):Observable<{ pagination: any; parkingData: any[]; response: any }>{
        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getParkingData';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };
        return this._httpClient.post(`${this.path}`,filter,opciones).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'estadoDes';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;
                // Prepare the pagination object
                let pagination = {};

                // Clone the records
                let parkingData: any[] | null =  response.result;

                if (parkingData) {
                    // Sort the records
                    if (sort === 'estadoDes') {
                        parkingData.sort((a, b) => {
                            const fieldA = a[sort].toString().toUpperCase();
                            const fieldB = b[sort].toString().toUpperCase();
                            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                        });
                    } else {
                        parkingData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                    }

                    // Paginate - Start
                    const itemsLength = parkingData.length;

                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), itemsLength);
                    const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                    // If the requested page number is bigger than
                    // the last possible page number, return null for
                    // records but also send the last possible page so
                    // the app can navigate to there
                    if (page > lastPage) {
                        parkingData = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        parkingData = parkingData.slice(begin, end);

                        // Prepare the pagination mock-api
                        pagination = {
                            length: itemsLength,
                            size: size,
                            page: page,
                            lastPage: lastPage,
                            startIndex: begin,
                            endIndex: end - 1
                        };
                    }
                    // Return a new observable with the response
                    this._parkingData$.next(parkingData);
                }
                return of({pagination,parkingData,response});
            })
        );
    }

    /**
     * SEARCH Parking Data
     */
    searchParkingData(p_search = ''):Observable<{ pagination: any; parkingData: any[]; }>{

        // Get available queries
        const search = p_search;
        const sort = 'estadoDes';
        const order = 'asc';
        const page = 0 ;
        const size = 1000;


        // Clone the records
        let parkingData: any[] | null =  this._parkingData$.getValue();

        // Sort the records
        if ( sort === 'estadoDes' )
        {
            parkingData.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            parkingData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            parkingData = parkingData.filter(ld =>
                ld.matricula?.toLowerCase().includes(search.toLowerCase())
                || ld.mtow?.toString().includes(search.toLowerCase())
                || ld.atoLlegada?.toLowerCase().includes(search.toLowerCase())
                || ld.rutaLlegada?.toLowerCase().includes(search.toLowerCase())
                || ld.tipoTrafico?.toLowerCase().includes(search.toLowerCase())
                || ld.nroVueloAterrizaje?.toString().includes(search.toLowerCase())
                || ld.rutaSalida?.toLowerCase().includes(search.toLowerCase())
                || ld.nroVueloSalida?.toString().includes(search.toLowerCase())
                || ld.oaciProcedenciaProv?.toLowerCase().includes(search.toLowerCase())
                || ld.oaciDestinoProv?.toLowerCase().includes(search.toLowerCase())
                || ld.observacion?.toLowerCase().includes(search.toLowerCase())
                || ld.estadoDes?.toLowerCase().includes(search.toLowerCase())
                || ld.estado?.toString().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = parkingData.length;

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
            parkingData = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            parkingData = parkingData.slice(begin, end);

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
        return of({pagination,parkingData});
    }

    /**
     * GET Rate Landing
     */
    getAllRateLanding():Observable<any[]>{

        this.pathRateLanding = 'https://apind.boa.bo/api/landing-nd/Landing/getAllRateLanding';
        this.pathCurrency = 'https://apind.boa.bo/api/landing-nd/Landing/getAllCurrencys';
        this.pathEntity = 'https://apind.boa.bo/api/landing-nd/Landing/getEntity';
        this.pathCountry = 'https://apind.boa.bo/api/landing-nd/Landing/getAllContries';
        this.pathAtoCategory = 'https://apind.boa.bo/api/landing-nd/Landing/getAtoCategory';
        this.pathAllAirports = 'https://apind.boa.bo/api/landing-nd/Landing/getAllAirports';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return forkJoin([
            this._httpClient.get(`${this.pathRateLanding}`),
            this._httpClient.get(`${this.pathCurrency}`),
            this._httpClient.get(`${this.pathEntity}`),
            this._httpClient.get(`${this.pathCountry}`),
            this._httpClient.get(`${this.pathAtoCategory}`),
            this._httpClient.get(`${this.pathAllAirports}`)
        ]).pipe(
            switchMap((data: any[]) => {

                let rateLanding = data[0].result;
                let currency = data[1].result;
                let entity = data[2].result;
                let country = data[3].result;
                let atoCategory = data[4].result;
                let airports = data[5].result;

                let filterCurrency;
                let filterCountry;
                let filterEntity;
                let filterCateryAto;
                let filterAirport;
                let descriptionAto;

                rateLanding.forEach(item => {
                    filterCurrency = currency.find( c => c.monedaID == item.monedaId);
                    item.currency = filterCurrency.nombre;
                });

                rateLanding.forEach(item => {
                    filterCountry = country.find( c => c.paisID == item.paisId);
                    item.country = filterCountry.nombrePis;
                });
                rateLanding.forEach(item => {
                    filterEntity = entity.find( c => c.id == item.entidadId);
                    item.entity = filterEntity.entityName;
                });
                rateLanding.forEach(item => {
                    filterCateryAto = atoCategory.find( c => c.id == item.categoriaAtoId);
                    filterAirport = airports.find( air => air.aeropuertoID == filterCateryAto.atoId);
                    descriptionAto = `${filterCateryAto.categorie} - ${filterAirport.nombreEstacion} (${filterAirport.codEstacion})`;
                    //item.rateLanding = `${item.country} ${item.entity} ${descriptionAto} ${item.servicio} ${item.tarifa} ${item.currency}`;
                    item.rateLanding = `${descriptionAto} ${item.tipoTrafico} ${item.pesoMinimo} ${item.pesoMaximo} ${item.currency}`;
                    item.categoryAto = filterCateryAto.categorie;
                });

                return of(rateLanding);
            })
        );
    }

    /**
     * GET Fee Data
     */
    loadFeeData(filter: any):Observable<{ pagination: any; feeData: any[]; response: any}>{

        this.path = 'https://apind.boa.bo/api/landing-nd/Landing/getLandingFee';

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            })
        };

        return this._httpClient.post(`${this.path}`,filter,opciones).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'ato';
                const order = 'asc';
                const page = 0 ;
                const size = 1000;
                // Prepare the pagination object
                let pagination = {};
                // Clone the records
                let feeData: any[] | null =  response.result;

                if (feeData) {
                    // Sort the records
                    if (sort === 'ato') {
                        feeData.sort((a, b) => {
                            const fieldA = a[sort].toString().toUpperCase();
                            const fieldB = b[sort].toString().toUpperCase();
                            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                        });
                    } else {
                        feeData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                    }

                    // Paginate - Start
                    const itemsLength = feeData.length;

                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), itemsLength);
                    const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                    // If the requested page number is bigger than
                    // the last possible page number, return null for
                    // records but also send the last possible page so
                    // the app can navigate to there
                    if (page > lastPage) {
                        feeData = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        feeData = feeData.slice(begin, end);

                        // Prepare the pagination mock-api
                        pagination = {
                            length: itemsLength,
                            size: size,
                            page: page,
                            lastPage: lastPage,
                            startIndex: begin,
                            endIndex: end - 1
                        };
                    }
                    // Return a new observable with the response
                    this._landingFee$.next(feeData);
                }
                return of({pagination,feeData, response});
            })
        );
    }

    /**
     * SEARCH Fee Data
     */
    searchFeeData(p_search = ''):Observable<{ pagination: any; feeData: any[]; }>{

        // Get available queries
        const search = p_search;
        const sort = 'ato';
        const order = 'asc';
        const page = 0 ;
        const size = 1000;


        // Clone the records
        let feeData: any[] | null =  this._landingFee$.getValue();

        // Sort the records
        if ( sort === 'ato' )
        {
            feeData.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            feeData.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the records
            feeData = feeData.filter(ld =>
                ld.ato.toLowerCase().includes(search.toLowerCase())
                || ld.categoria.toLowerCase().includes(search.toLowerCase())
                || ld.entidad.toLowerCase().includes(search.toLowerCase())
                || ld.servicio.toLowerCase().includes(search.toLowerCase())
                || ld.tipoTrafico.toLowerCase().includes(search.toLowerCase())
                || ld.pesoMin.toString().includes(search.toLowerCase())
                || ld.pesoMax.toString().includes(search.toLowerCase())
                || ld.tarifa.toString().includes(search.toLowerCase())
                || ld.nombre.toLowerCase().includes(search.toLowerCase())
                || ld.prefijo.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = feeData.length;

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
            feeData = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            feeData = feeData.slice(begin, end);

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
        return of({pagination,feeData});
    }

    getClosingDates(): Observable<any>{
        return from (this._apiErp.post(
            'contabilidad/Landing/getClosingDates',
            {start:0,limit:50}
        )).pipe(
            switchMap((response: any) => {
                return of(response)
            })
        );
    }

}
