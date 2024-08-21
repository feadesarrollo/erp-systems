import { Injectable } from '@angular/core';
import PxpClient from 'pxp-client';
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class ApiErpService {

    constructor(
        private _authService: AuthService
    ) { }

    get (url) {
        return PxpClient.doRequest({
            url: url,
            params: {
                start: 0,
                limit: 50,
            },
        });
    }

    post (url,params) {
        return PxpClient.doRequest({
            url: url,
            params:params,
        })
            .then( (resp) => {
                 return resp;
            })
            .catch(
                (error)=>{
                    console.warn('error',error);
                    // Redirect
                    this._authService.redirect();

                    // Reload the app
                    //location.reload();
                }
            );
    }
}
