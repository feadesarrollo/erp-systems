import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, of, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import PxpClient from 'pxp-client';
import { environment } from '../../../environments/environment';

import Utf8 from "crypto-js/enc-utf8";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
import {Router} from "@angular/router";

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;
    private readonly _secret: any;
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
        let auth = JSON.parse(localStorage.getItem('aut'));

        if( auth != null ) {
            this._authenticated = true;
        }else{
            this._router.navigate(['sign-in']);
        }
        this._secret = 'YOUR_VERY_CONFIDENTIAL_SECRET_FOR_SIGNING_JWT_TOKENS!!!';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(account: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', account);
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // Renew token
        return this._httpClient.post('api/auth/refresh-access-token', {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Redirect to
     */
    redirect(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }


    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        /*if ( !this.accessToken )
        {
            return of(false);
        }*/

        // Check the access token expire date
        /*if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }*/

        // If the access token exists and it didn't expire, sign in using it
        return of(this._authenticated);//this.signInUsingToken();
    }

    /**
     * Initialize params for authentication ERP
     */
    initErp() {
        PxpClient.init(
            environment.host,
            environment.baseUrl,
            environment.mode,
            environment.port,
            environment.protocol,
            environment.backendRestVersion,
            environment.initWebSocket,
            environment.portWs,
            environment.backendVersion,
            environment.urlLogin,
            environment.storeToken
        );
    }

    /**
     * Sign in ERP
     *
     * @param credentials
     */
    signIn(credentials: { email: string, password: string }) : Observable<any> {

        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        this.initErp();
        return from(PxpClient.login(credentials.email, credentials.password)).pipe(
            switchMap((response:any)=>{
                if ( response.data.success ) {
                    //this.accessToken = this._generateJWTToken();
                    this._authenticated = true;

                    let user = {
                        avatar: `../uploaded_files/sis_parametros/Archivo/${response.logo}`,
                        email: response.user,
                        id: response.id_usuario,
                        name: response.nombre_usuario,
                        status: "online"
                    };

                    let protocol = location.protocol.replace(':', '');
                    // Store the user on the user service
                    this._userService.user = {
                        avatar: `${protocol}://erp.boa.bo/uploaded_files/sis_parametros/Archivo/${response.logo}`,
                        email: response.user,
                        id: response.id_usuario,
                        name: response.nombre_usuario,
                        status: "online"
                    };

                    // Return a new observable with the response
                    return of({
                        //accessToken: this.accessToken,
                        //tokenType: "bearer",
                        user: user,
                        navigation: response.navigation
                    });
                }
            })
        );
    }

    /**
     * Sign out ERP
     */
    signOut() : Observable<any> {
        localStorage.removeItem('aut');
        this._authenticated = false;
        PxpClient.logout();

        // Return the observable
        return of(true);
    }

    /**
     * Generates a JWT token using CryptoJS library.
     *
     * @private
     */
    private _generateJWTToken(): string
    {
        // Define token header
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        // Calculate the issued at and expiration dates
        const date = new Date();
        const iat = Math.floor(date.getTime() / 1000);
        const exp = Math.floor((date.setDate(date.getDate() + 7)) / 1000);

        // Define token payload
        const payload = {
            iat: iat,
            iss: 'Boby',
            exp: exp
        };

        // Stringify and encode the header
        const stringifiedHeader = Utf8.parse(JSON.stringify(header));
        const encodedHeader = this._base64url(stringifiedHeader);

        // Stringify and encode the payload
        const stringifiedPayload = Utf8.parse(JSON.stringify(payload));
        const encodedPayload = this._base64url(stringifiedPayload);

        // Sign the encoded header and mock-api
        let signature: any = encodedHeader + '.' + encodedPayload;
        signature = HmacSHA256(signature, this._secret);
        signature = this._base64url(signature);

        // Build and return the token
        return encodedHeader + '.' + encodedPayload + '.' + signature;
    }

    /**
     * Return base64 encoded version of the given string
     *
     * @param source
     * @private
     */
    private _base64url(source: any): string
    {
        // Encode in classical base64
        let encodedSource = Base64.stringify(source);

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        // Return the base64 encoded string
        return encodedSource;
    }

}
