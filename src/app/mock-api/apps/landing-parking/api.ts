import { Injectable } from '@angular/core';
import { from, map, Observable, of  } from 'rxjs';
import { BobyMockApiService, BobyMockApiUtils } from '@boby/lib/mock-api';
import { ApiErpService } from '../../../core/api-erp/api-erp.service';

@Injectable({
    providedIn: 'root'
})
export class LandingParkingApi
{

    /**
     * Constructor
     */
    constructor(
        private _bobyApiService: BobyMockApiService,
        private _apiErp:ApiErpService
    ) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {

        // -----------------------------------------------------------------------------------------------------
        // @ Claims - GET
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onGet('api/apps/landing-data/getConciliationClosing')
            .reply(({request}) => {

                return from(this._apiErp.post('contabilidad/Landing/getConciliationClosing', {
                    list: request.params.get('list'),
                    startDate:  request.params.get('startDate'),
                    endDate: request.params.get('endDate'),
                    airport: request.params.get('airport'),
                    aircraft: request.params.get('aircraft')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('page') ?? '0', 10);
                    const size = parseInt(request.params.get('size') ?? '10', 10);
                    const djson = JSON.parse(response.datos[0].djson);//console.warn('djson', djson);
                    // Clone the products
                    let items: any[] | null = djson.landing_closing;

                    // Paginate - Start
                    const itemsLength = djson.landing_closing.length;

                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), itemsLength);
                    const lastPage = Math.max(Math.ceil(itemsLength / size), 1);

                    // Prepare the pagination object
                    let pagination = {};

                    // If the requested page number is bigger than
                    // the last possible page number, return null for
                    // products but also send the last possible page so
                    // the app can navigate to there
                    if ( page > lastPage ) {
                        items = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        items = items.slice(begin, end);

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

                    // Return a success code along with some data
                    return [200, /*response*/{
                        items,
                        pagination,
                        djson
                    }];
                }));
            });

        /*this._bobyApiService
            .onPost('api/apps/landing-data/getConciliationClosing')
            .reply(({request}) => {
                console.warn('request.body.list',request.body.list);
                return from(this._apiErp.post('contabilidad/Landing/getConciliationClosing',
                    {
                        list: JSON.stringify(request.body.list),
                        startDate: request.body.startDate,
                        endDate: request.body.endDate,
                        ato: request.body.ato,
                        aircraft: request.body.aircraft
                    }
                )).pipe(map((response:any) => {

                    const page = 0;//parseInt(request.params.get('page') ?? '0', 10);
                    const size = 10;//parseInt(request.params.get('size') ?? '10', 10);
                    // Clone the products
                    let customers: any[] | null = response.datos;

                    // Paginate - Start
                    const customersLength = response.total;

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
                        customers = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        customers = customers.slice(begin, end);

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
                    return [200, {
                        customers,
                        pagination
                    }];
                }));
            });*/

    }
}
