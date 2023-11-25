import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { BobyLoadingService } from '@boby/services/loading/loading.service';

@Injectable()
export class BobyLoadingInterceptor implements HttpInterceptor
{
    handleRequestsAutomatically: boolean;

    /**
     * Constructor
     */
    constructor(
        private _bobyLoadingService: BobyLoadingService
    )
    {
        // Subscribe to the auto
        this._bobyLoadingService.auto$
            .subscribe((value) => {
                this.handleRequestsAutomatically = value;
            });
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
    {
        // If the Auto mode is turned off, do nothing
        if ( !this.handleRequestsAutomatically )
        {
            return next.handle(req);
        }

        // Set the loading status to true
        this._bobyLoadingService._setLoadingStatus(true, req.url);

        return next.handle(req).pipe(
            finalize(() => {
                // Set the status to false if there are any errors or the request is completed
                this._bobyLoadingService._setLoadingStatus(false, req.url);
            }));
    }
}
