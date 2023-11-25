import { Injectable } from '@angular/core';
import { from, map, Observable, of  } from 'rxjs';
import { BobyMockApiService, BobyMockApiUtils } from '@boby/lib/mock-api';
import { assign, cloneDeep } from 'lodash-es';

import { ApiErpService } from '../../../core/api-erp/api-erp.service';



@Injectable({
    providedIn: 'root'
})
export class ErpMockApi
{

    private _roles: any[] = [];
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
        // @ Claims - GET
        // -----------------------------------------------------------------------------------------------------
        /*this._bobyApiService
            .onGet('api/apps/claims-management/getCategoryList')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getCategoryList', {code:request.body.code})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });*/

        this._bobyApiService
            .onGet('api/apps/claims-management/listCustomers')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Cliente/listarCliente', {
                    start:  request.params.get('start'),
                    limit: request.params.get('limit')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('page') ?? '0', 10);
                    const size = parseInt(request.params.get('size') ?? '10', 10);
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
                    return [200, /*response*/{
                        customers,
                        pagination
                    }];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/postCliente')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Cliente/insertarCliente', {
                    id_cliente:localStorage.getItem('status') == 'new' ? '' : request.body.id_cliente,
                    nombre:request.body.nombre,
                    apellido_paterno:request.body.apellido_paterno,
                    apellido_materno:request.body.apellido_materno,
                    genero:request.body.genero,
                    ci:request.body.ci,
                    lugar_expedicion:request.body.lugar_expedicion,
                    nacionalidad:request.body.nacionalidad,
                    celular:request.body.celular,
                    telefono:request.body.telefono,
                    email:request.body.email,
                    email2:request.body.email2,
                    direccion:request.body.direccion,
                    id_pais_residencia:request.body.id_pais_residencia,
                    ciudad_residencia:request.body.ciudad_residencia,
                    barrio_zona:request.body.barrio_zona
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/claims-management/getTemplateFile')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/getTemplateFile', {})).pipe(map((response:any) => {

                    // Clone the items
                    let djson = JSON.parse(response.datos[0].djson);
                    let items = djson;

                    // See if a folder id exist
                    const folderId = request.params.get('folderId') === 'null' ? null : request.params.get('folderId');

                    // Filter the items by folder id. If folder id is null,
                    // that means we want to root items which have folder id
                    // of null
                    items = items.filter(item => item.json_template.folderId === folderId);

                    // Separate the items by folders and files
                    const folders = items.filter(item => item.json_template.type === 'carpeta');
                    const files = items.filter(item => item.json_template.type !== 'carpeta');

                    // Sort the folders and files alphabetically by filename
                    folders.sort((a, b) => a.json_template.name.localeCompare(b.json_template.name));
                    files.sort((a, b) => a.json_template.name.localeCompare(b.json_template.name));

                    // Figure out the path and attach it to the response
                    // Prepare the empty paths array
                    const pathItems = djson;
                    const path = [];

                    // Prepare the current folder
                    let currentFolder = null;
                    // Get the current folder and add it as the first entry
                    if ( folderId )
                    {
                        currentFolder = pathItems.find(item => item.json_template.id === folderId);
                        path.push(currentFolder);
                    }

                    // Start traversing and storing the folders as a path array
                    // until we hit null on the folder id
                    while ( currentFolder?.folderId )
                    {
                        currentFolder = pathItems.find(item => item.json_template.id === currentFolder.folderId);
                        if ( currentFolder )
                        {
                            path.unshift(currentFolder);
                        }
                    }

                    // Return a success code along with some data
                    return [200,
                        {
                            folders,
                            files,
                            path
                        }
                    ];
                }));
            });
        /*this._bobyApiService
            .onGet('api/apps/claims-management/listClaims')
            .reply(({request}) => {
                console.warn('request.params',request.params);
                return from(this._apiErp.post('reclamo/Reclamo/getClaimsList',{
                    estado: request.params.get('estado'),
                    id_gestion: request.params.get('id_gestion'),
                    start: request.params.get('start'),
                    limit: request.params.get('limit'),
                    sort: request.params.get('sort'),
                    dir: request.params.get('dir')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('start') ?? '0', 10);
                    const size = parseInt(request.params.get('limit') ?? '10', 10);
                    // response the claims
                    let resp = JSON.parse(response.datos[0].listclaims);
                    let claims: any[] | null = resp.claims;
                    // Paginate - Start
                    const claimsLength = resp.total;

                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), claimsLength);
                    const lastPage = Math.max(Math.ceil(claimsLength / size), 1);
                    // Prepare the pagination object
                    let pagination = {
                        length    : claimsLength,
                        size      : size,
                        page      : page,
                        lastPage  : lastPage,
                        startIndex: begin,
                        endIndex  : end - 1
                    };
                    // Return a success code along with some data
                    return [200,{
                        claims,
                        pagination
                    }];

                }));
            });*/
        // -----------------------------------------------------------------------------------------------------
        // @ Claims - POST
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onPost('api/apps/claims-management/listClaims')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getClaimsList',{
                    estado:request.body.estado,
                    id_gestion:request.body.id_gestion,
                    start: request.body.start,
                    limit: request.body.limit,
                    sort: request.body.sort,
                    dir: request.body.dir,
                    query: request.body.query
                })).pipe(map((response: any) => {

                    // response the claims
                    let resp = JSON.parse(response.datos[0].listclaims);

                    // Return a success code along with some data
                    return [200, resp];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/insertarReclamo')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/insertarReclamo', {...request.body.step1, ...request.body.step2, ...request.body.step3, ...request.body.step4})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteClaim')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/eliminarReclamo', {id_reclamo:request.params.get('id_reclamo')})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/getSummaryDetail')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getDetalleResumen',{
                    fecha_ini: request.body.fecha_ini,
                    fecha_fin: request.body.fecha_fin
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        // -----------------------------------------------------------------------------------------------------
        // @ Contact - POST
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService.onPost('api/apps/contacts/contact')
            .reply(() => {
                // Generate a new contact
                const newRole = {
                    id          : BobyMockApiUtils.guid(),
                    name        : 'New Role',
                    roles      : [],
                    state: []
                };

                // Unshift the new contact
                this._roles.unshift(newRole);

                // Return the response
                return [200, newRole];
            });

        /***************************************** ROLES *****************************************/
        this._bobyApiService
            .onPost('api/apps/claims-management/insertRol')
            .reply(({request}) => {

                    return from(this._apiErp.post('reclamo/Reclamo/insertRole', {id_rol:request.body.id_rol, rol:JSON.stringify(request.body)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/claims-management/getRolesList')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/getRolesList', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/claims-management/getRolesByOfficial')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/getRolesByOfficial', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteRole')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/deleteRole', {id_rol:request.params.get('id_rol')})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        /***************************************** ROLES *****************************************/

        /***************************************** FILES *****************************************/
        this._bobyApiService
            .onPost('api/apps/claims-management/listWfDocuments')
            .reply(({request}) => {
                return from(this._apiErp.post('workflow/DocumentoWf/listarDocumentoWf',{
                    start:request.body.start,
                    limit:request.body.limit,
                    sort:request.body.sort,
                    dir:request.body.dir,
                    id_proceso_wf:request.body.id_proceso_wf,
                    todos_documentos:request.body.todos_documentos
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });
        /***************************************** FILES *****************************************/

        /***************************************** GANTT *****************************************/
        this._bobyApiService
            .onPost('api/apps/claims-management/listGanttStructure')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getEstructuraGantt',{
                    start:request.body.start,
                    limit:request.body.limit,
                    id_proceso_wf:request.body.id_proceso_wf
                    })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });
        /***************************************** GANTT *****************************************/

        /***************************************** ANSWER *****************************************/
        this._bobyApiService
            .onPost('api/apps/claims-management/getAnswersList')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Respuesta/getAnswersList',{
                    estado:request.body.estado,
                    gestion:request.body.gestion,
                    start: request.body.start,
                    limit: request.body.limit
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });
        /***************************************** ANSWER *****************************************/

        this._bobyApiService
            .onPost('api/apps/claims-management/sendMail')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/sendMail', {compose : JSON.stringify(request.body.compose)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/validateFRD')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/validateFRD', {params : JSON.stringify(request.body.params)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onGet('api/apps/claims-management/getParameters')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getParameters', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/postParameter')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/postParameter', {parameter:JSON.stringify(request.body.parameter),id_settings:request.body.id_settings,status:request.body.status})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteParameter')
            .reply(({request}) => {
                const id_settings = request.params.get('id_settings');
                return from(this._apiErp.post('reclamo/Reclamo/deleteParameter', {id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onPost('api/apps/claims-management/postValue')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/postValue', {newValue:JSON.stringify(request.body.newValue), id_settings: request.body.id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onPatch('api/apps/claims-management/patchValue')
            .reply(({request}) => {

                // Get the id and label
                const id = request.body.id;
                const value = cloneDeep(request.body.value);
                return from(this._apiErp.post('reclamo/Reclamo/patchValue', {updateValue:JSON.stringify(request.body.updatedValue), id_settings: request.body.id_settings, id: request.body.id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Values - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteValue')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');
                const id_settings = request.params.get('id_settings');

                return from(this._apiErp.post('reclamo/Reclamo/deleteValue', {id_settings, id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onPost('api/apps/claims-management/postTemplateFile')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/postTemplateFile', {file:JSON.stringify(request.body)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteTemplateFile')
            .reply(({request}) => {

                // Get the id
                const id_template = request.params.get('id_template');

                return from(this._apiErp.post('reclamo/Reclamo/deleteTemplateFile', {id_template})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        /********************************************* GROUP EMAILS *********************************************/

        this._bobyApiService
            .onGet('api/apps/claims-management/getGroupEmails')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/getGroupEmails', {})).pipe(map((response: any) => {
                    const groupEmails = JSON.parse(response.datos[0].djson);
                    // Return a success code along with some data
                    return [200, groupEmails];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/claims-management/postGroupEmails')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/postGroupEmails', {json_classifier:JSON.stringify(request.body.classifier),id_classifiers:request.body.id_classifiers,status:request.body.status})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteGroupEmails')
            .reply(({request}) => {
                const id_classifiers = request.params.get('id_classifiers');
                return from(this._apiErp.post('reclamo/Reclamo/deleteGroupEmails', {id_classifiers})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onPost('api/apps/claims-management/postEmail')
            .reply(({request}) => {

                return from(this._apiErp.post('reclamo/Reclamo/postEmail', {newValue:JSON.stringify(request.body.newValue), id_classifiers: request.body.id_classifiers})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPatch('api/apps/claims-management/patchEmail')
            .reply(({request}) => {

                // Get the id and label
                const id = request.body.id;
                const value = cloneDeep(request.body.value);
                return from(this._apiErp.post('reclamo/Reclamo/patchEmail', {updateValue:JSON.stringify(request.body.updatedValue), id_classifiers: request.body.id_classifiers, id: request.body.id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));

            });

        // -----------------------------------------------------------------------------------------------------
        // @ Values - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteEmail')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');
                const id_classifiers = request.params.get('id_classifiers');

                return from(this._apiErp.post('reclamo/Reclamo/deleteEmail', {id_classifiers, id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        /********************************************* GROUP EMAILS *********************************************/

        this._bobyApiService
            .onGet('api/apps/claims-management/getRipatClaims')
            .reply(({request}) => {
                return from(this._apiErp.post('reclamo/Reclamo/listarRegRipat', {
                    id_gestion: request.params.get('id_gestion'),
                    start: request.params.get('start'),
                    limit: request.params.get('limit'),
                    sort: request.params.get('sort'),
                    dir: request.params.get('dir')
                })).pipe(map((response: any) => {
                    const sort = request.params.get('sort');
                    const order = 'asc';
                    const page = parseInt(request.params.get('start') ?? '0', 10);
                    const size = parseInt(request.params.get('limit') ?? '7000000', 10);
                    // Clone the products
                    let claims: any[] | null = response.datos;

                    // Sort the products
                    if ( sort === 'orden' )
                    {
                        claims.sort((a, b) => {
                            const fieldA = a[sort].toString().toUpperCase();
                            const fieldB = b[sort].toString().toUpperCase();
                            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                        });
                    }
                    else
                    {
                        claims.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                    }

                    // Paginate - Start
                    const customersLength = claims.length;

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
                        claims = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        claims = claims.slice(begin, end);

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
                        claims,
                        pagination
                    }];
                }));
            });

    }
}
