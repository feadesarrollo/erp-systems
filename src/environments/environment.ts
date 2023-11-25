// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    host: '10.150.0.91',
    baseUrl: 'kerp/pxp/lib/rest',
    mode: 'cors',
    port: location.protocol.replace(':', '') == 'https' ? '443' : '80',
    protocol: location.protocol.replace(':', ''),
    backendRestVersion: 1,
    initWebSocket: 'NO',
    portWs: '8010',
    serviceHost: 'http://172.17.45.86',//172.17.58.51
    filesUrl : 'http://10.150.0.91/kerp/',
    //Credentiales Google
    client_id: '1018512937102-d41t4s69s6ccdb4o3mpceagorfhe48r8.apps.googleusercontent.com',
    client_secret: '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',
    client_fb: '660203996129020',
    backendVersion: 'v1',
    urlLogin: '',
    storeToken: false
};


/*export const environment = {
    production: false,
    //host: '10.150.0.91',
    host: '127.0.0.1',
    //baseUrl: 'kerp_breydi/pxp/lib/rest',
    baseUrl: 'api/erp-nd/Erp/doRequest',
    mode: 'cors',
    //port: location.protocol.replace(':', '') == 'https' ? '443' : '80',
    port:3800,
    protocol: location.protocol.replace(':', ''),
    backendRestVersion: 1,
    initWebSocket: 'NO',
    portWs: '8010',
    serviceHost: 'http://172.17.45.86',
    filesUrl : 'http://10.150.0.91/kerp/',
    backendVersion: 'v1',
    urlLogin: '',
    storeToken: true
};*/
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
