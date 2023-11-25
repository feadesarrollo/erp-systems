import { Injectable } from '@angular/core';
import { from, map, Observable, of  } from 'rxjs';
import { BobyMockApiService } from '@boby/lib/mock-api';
import {ApiErpService} from "../../../core/api-erp/api-erp.service";

@Injectable({
    providedIn: 'root'
})
export class NotificationsMockApi
{
    private _notifications: any = [];

    /**
     * Constructor
     */
    constructor(private _bobyApiService: BobyMockApiService,
                private _apiErp:ApiErpService)
    {
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
        // @ Notifications - GET
        // -----------------------------------------------------------------------------------------------------

        this._bobyApiService
            .onGet('api/notifications/notifications')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/getRolesList', {})).pipe(
                    map((response) => {
                        // Return a success code along with some data
                        return [200, response];
                    }
                ));
            });

    }
}
