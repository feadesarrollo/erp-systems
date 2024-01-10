import { Injectable } from '@angular/core';
import { from, map } from 'rxjs';
import { BobyMockApiService, BobyMockApiUtils } from '@boby/lib/mock-api';
import { cloneDeep } from 'lodash-es';
import { ApiErpService } from '../../../core/api-erp/api-erp.service';
import * as moment from "moment";



@Injectable({
    providedIn: 'root'
})
export class HumanTalentApi
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

        // ---------------------------------------------------------------------------------------------------
        // @ Contact - POST
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService.onPost('api/apps/human-talent/contact')
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
            .onPost('api/apps/human-talent/postRol')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/HumanTalent/postRol', {id_rol:request.body.id_rol, rol:JSON.stringify(request.body)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getRoles')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/HumanTalent/getRoles', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getRolesByOfficial')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/HumanTalent/getRolesByOfficial', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/claims-management/deleteRole')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/HumanTalent/deleteRole', {id_rol:request.params.get('id_rol')})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        /***************************************** ROLES *****************************************/

        this._bobyApiService
            .onGet('api/apps/human-talent/getParameters')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/HumanTalent/getParameters', {})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/human-talent/postParameter')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/HumanTalent/postParameter', {parameter:JSON.stringify(request.body)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/human-talent/postValue')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/HumanTalent/postValue', {newValue:JSON.stringify(request.body.newValue), id_settings: request.body.id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onDelete('api/apps/human-talent/deleteParameter')
            .reply(({request}) => {
                const id_settings = request.params.get('id_settings');
                return from(this._apiErp.post('organigrama/HumanTalent/deleteParameter', {id_settings})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        // -----------------------------------------------------------------------------------------------------
        // @ Labels - PATCH
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onPatch('api/apps/human-talent/patchValue')
            .reply(({request}) => {

                // Get the id and label
                const id = request.body.id;
                const value = cloneDeep(request.body.value);
                return from(this._apiErp.post('organigrama/HumanTalent/patchValue', {updateValue:JSON.stringify(request.body.updatedValue), id_settings: request.body.id_settings, id: request.body.id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));

            });

        // -----------------------------------------------------------------------------------------------------
        // @ Values - DELETE
        // -----------------------------------------------------------------------------------------------------
        this._bobyApiService
            .onDelete('api/apps/human-talent/deleteValue')
            .reply(({request}) => {

                // Get the id
                const id = request.params.get('id');
                const id_settings = request.params.get('id_settings');

                return from(this._apiErp.post('organigrama/HumanTalent/deleteValue', {id_settings, id})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });


        this._bobyApiService
            .onGet('api/apps/human-talent/getItems')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/Cargo/listarCargo', {
                    id_uo:  request.params.get('id_uo'),
                    start:  request.params.get('start'),
                    limit:  request.params.get('limit'),
                    sort: request.params.get('sort'),
                    dir: request.params.get('dir'),
                    query: request.params.get('query')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('page') ?? '0', 10);
                    const size = parseInt(request.params.get('size') ?? '50', 10);

                    // Clone the items
                    let items: any[] | null = response.datos;

                    // Paginate - Start
                    const itemsLength = response.total;
                    const total = response.total;

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
                    return [200, {
                        items,
                        pagination,
                        total
                    }];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getSummativeProcess')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/SummativeProcess/getSummativeProcess', {
                    start:  request.params.get('start'),
                    limit: request.params.get('limit')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('page') ?? '0', 10);
                    const size = parseInt(request.params.get('size') ?? '10', 10);
                    // Clone the products
                    let summatives: any[] | null = JSON.parse(response.datos[0].djson);

                    // Paginate - Start
                    const summativesLength = summatives.length;
                    // Calculate pagination details
                    const begin = page * size;
                    const end = Math.min((size * (page + 1)), summativesLength);
                    const lastPage = Math.max(Math.ceil(summativesLength / size), 1);

                    // Prepare the pagination object
                    let pagination = {};

                    // If the requested page number is bigger than
                    // the last possible page number, return null for
                    // products but also send the last possible page so
                    // the app can navigate to there
                    if ( page > lastPage ) {
                        summatives = null;
                        pagination = {
                            lastPage
                        };
                    } else {
                        // Paginate the results by size
                        summatives = summatives.slice(begin, end);

                        // Prepare the pagination mock-api
                        pagination = {
                            length    : summativesLength,
                            size      : size,
                            page      : page,
                            lastPage  : lastPage,
                            startIndex: begin,
                            endIndex  : end - 1
                        };
                    }

                    // Return a success code along with some data
                    return [200,{
                        summatives,
                        pagination
                    }];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/human-talent/postSummativeProcess')
            .reply(({request}) => {
                //console.warn('request.body',request.body);
                return from(this._apiErp.post('organigrama/SummativeProcess/postSummativeProcess', {
                    id_summative_process : request.body.statusSummative == 'new' ? '' : request.body.id_summative_process,
                    id_funcionario : request.body.id_funcionario,
                    start_date : moment.utc(request.body.start_date).format('DD/MM/YYYY'),
                    end_date : moment.utc(request.body.end_date).format('DD/MM/YYYY'),
                    summative_reason : request.body.summative_reason
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/human-talent/deleteSummativeProcess')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/SummativeProcess/deleteSummativeProcess', {id_summative_process:request.params.get('id_summative_process')})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getUpdateHistory')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/SolicitudTicket/getUpdateHistory', {
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
                    let items: any[] | null = JSON.parse(response.datos[0].djson);

                    // Sort the items
                    if ( sort === 'usuario' )
                    {
                        items.sort((a, b) => {
                            const fieldA = a[sort].toString().toUpperCase();
                            const fieldB = b[sort].toString().toUpperCase();
                            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                        });
                    }
                    else
                    {
                        items.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                    }

                    // Paginate - Start
                    const itemsLength = items.length;

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
                    return [200, {
                        items,
                        pagination
                    }];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/searchOrganizationChart')
            .reply(({request}) => {
                return from(this._apiErp.post('organigrama/EstructuraUo/searchOrganizationChart', {
                    query: request.params.get('query')
                })).pipe(map((response: any) => {
                    const datos = JSON.parse(response.data.orga_json);
                    // Return a success code along with some data
                    return [200, {datos}];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getAllocations')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/UoFuncionario/listarUoFuncionario', {
                    id_uo:  request.params.get('id_uo'),
                    start:  request.params.get('start'),
                    limit:  request.params.get('limit'),
                    status:  request.params.get('status')
                })).pipe(map((response: any) => {

                    const page = parseInt(request.params.get('page') ?? '0', 10);
                    const size = parseInt(request.params.get('size') ?? '10', 10);

                    // Clone the items
                    let items: any[] | null = response.datos;

                    // Paginate - Start
                    const itemsLength = response.total;

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
                    return [200, {
                        items,
                        pagination
                    }];
                }));
            });

        this._bobyApiService
            .onPost('api/apps/human-talent/postItem')
            .reply(({request}) => {
                //console.warn('request.body',request.body);
                return from(this._apiErp.post('organigrama/Cargo/insertarCargo', {
                    id_cargo : request.body.statusItem == 'new' ? '' : request.body.id_cargo,
                    id_tipo_contrato : request.body.id_tipo_contrato,
                    id_oficina : request.body.id_oficina,
                    id_uo : request.body.id_uo,
                    id_temporal_cargo : request.body.id_temporal_cargo,
                    id_escala_salarial : request.body.id_escala_salarial,
                    codigo : request.body.codigo,
                    fecha_ini : /*moment.utc(*/request.body.fecha_ini/*).format('DD/MM/YYYY')*/,
                    fecha_fin : /*moment.utc(*/request.body.fecha_fin/*).format('DD/MM/YYYY')*/,

                    id_gestion : request.body.id_gestion,
                    id_centro_costo : request.body.id_centro_costo,
                    id_ot : request.body.id_ot,
                    porcentaje : request.body.porcentaje,
                    fecha_ini_cc : /*moment.utc(*/request.body.fecha_ini_cc/*).format('DD/MM/YYYY')*/,
                    fecha_fin_cc : /*moment.utc(*/request.body.fecha_fin_cc/*).format('DD/MM/YYYY')*/
                })).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onGet('api/apps/human-talent/getTemplateFile')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/TipoDocumentoContrato/getTemplateFile', {})).pipe(map((response:any) => {

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

        this._bobyApiService
            .onPost('api/apps/human-talent/postTemplateFile')
            .reply(({request}) => {

                return from(this._apiErp.post('organigrama/TipoDocumentoContrato/postTemplateFile', {file:JSON.stringify(request.body)})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

        this._bobyApiService
            .onDelete('api/apps/human-talent/deleteTemplateFile')
            .reply(({request}) => {

                // Get the id
                const id_template = request.params.get('id_template');

                return from(this._apiErp.post('organigrama/TipoDocumentoContrato/deleteTemplateFile', {id_template})).pipe(map((response) => {
                    // Return a success code along with some data
                    return [200, response];
                }));
            });

    }


}
