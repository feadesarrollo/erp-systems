import { Injectable } from '@angular/core';
import PxpClient from 'pxp-client';

@Injectable({
  providedIn: 'root'
})
export class ApiErpService {

    constructor() { }

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
        });
    }
}
