import { Injectable } from '@angular/core';
import { Observable, of, from, BehaviorSubject } from "rxjs";
import {switchMap, map, tap, catchError} from "rxjs/operators";
import { ApiErpService } from '../../../core/api-erp/api-erp.service';
import { LeafNode, LoadMoreNode, TodoItemNode } from "../human-talent/human-talent.types";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Validators} from "@angular/forms";
@Injectable({
  providedIn: 'root'
})
export class HumanTalentService {

    private _officials$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _offices$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _lottery$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _selected$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _testQuery$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _testType$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _organization: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _selectedNode$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    batchNumber = 100;

    _orgaStructure = new BehaviorSubject<LoadMoreNode[]>([]);
    nodeMap = new Map<string, LoadMoreNode>();
    treeNodeMap = new Map<string, TodoItemNode>();

    _orgaChartData = new BehaviorSubject< any >([]);
    private _statusOrga: BehaviorSubject<any | null> = new BehaviorSubject('');
    /**
     * Getter for orga chart data
     */
    get selectedNode$(): Observable<any[]>
    {
        return this._selectedNode$.asObservable();
    }

    /**
     * Getter for orga chart data
     */
    set selectedNode(value)
    {
        this._selectedNode$.next(value);
    }

    /**
     * Getter for orga chart data
     */
    get orgaChartData$(): Observable<any[]>
    {
        return this._orgaStructure.asObservable();
    }
    /************************************ TREE REFACTOR ************************************/

    /**
     * The Json object for to-do list data.
     */
    TREE_DATA = {
        Groceries: {
            'Almond Meal flour': null,
            'Organic eggs': null,
            'Protein Powder': null,
            Fruits: {
                Apple: null,
                Berries: ['Blueberry', 'Raspberry'],
                Orange: null,
            },
        },
        Reminders: ['Cook dinner', 'Read the Material Design spec', 'Upgrade Application to Angular'],
    };

    dataChange = new BehaviorSubject<TodoItemNode[]>([]);

    get data(): TodoItemNode[] {
        return this.dataChange.value;
    }

    /**
     * Setter for status orga
     */
    set statusOrga(value)
    {
        this._statusOrga.next(value);
    }

    /**
     * Getter for status orga
     */
    get statusOrga$(): Observable<any>
    {
        return this._statusOrga.asObservable();
    }

    initialize() {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested

        from(this._apiErp.post( 'organigrama/EstructuraUo/listarEstructuraUo',
            {id_uo: '', node: 'id'}
        )).subscribe(( response: any )=>{
            const data = response.map(item => {
                return this._generateTreeNode(item)
            });
            this.dataChange.next(data);
        });

        //     file node as children.
        //const data = this.buildFileTree(this.TREE_DATA, 0);

        // Notify the change.
        //this.dataChange.next(data);
    }

    searchNode(query) {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        from(this._apiErp.post( 'organigrama/EstructuraUo/listarEstructuraUo',
            {filtro:'activo',criterio_filtro_arb: query,id_uo:'',node:'id'}
        )).subscribe(( response: any )=>{
            const data = response.map(item => {
                return this._generateTreeNode(item)
            });
            this.dataChange.next(data);
        });
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    /*buildFileTree(obj: {[key: string]: any}, level: number): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TodoItemNode();
            node.item = key;

            if (value != null) {
                if (typeof value === 'object') {
                    node.children = this.buildFileTree(value, level + 1);
                } else {
                    node.item = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }*/

    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string) {
        if (parent.children) {
            parent.children.push({item: name} as TodoItemNode);
            this.dataChange.next(this.data);
        }
    }

    updateItem(node: TodoItemNode, name: string) {
        node.item = name;
        this.dataChange.next(this.data);
    }

    /** Expand a node whose children are not loaded */
    loadMore(node) {
        node.isLoading = true;
        from(this._apiErp.post( 'organigrama/EstructuraUo/listarEstructuraUo',
            {id_uo: node.id, node: node.id}
        )).subscribe(( response: any )=>{
            node.isLoading = false;
            if (!this.treeNodeMap.has(node.id)) {
                return;
            }

            const parent = this.treeNodeMap.get(node.id)!;
            const children = response!;

            if (parent.children!.length > 0) {
                return;
            }
            const newChildrenNumber = parent.children!.length + this.batchNumber;

            const nodes = (children.slice(0, newChildrenNumber)).map(item => {
                return this._generateTreeNode(item);
            });

            if (newChildrenNumber < children.length) {
                // Need a new load more node
                nodes.push(new TodoItemNode('LOAD_MORE', false, node.item));
            }

            parent.childrenChange.next(nodes);
            this.dataChange.next(this.dataChange.value);
        });

    }

    /************************************ TREE REFACTOR ************************************/
    constructor(
        private _apiErp:ApiErpService,
        private _httpClient: HttpClient
    ) {
        //this.initialize();
    }

    getNodeMap(id_uo){
        return this.nodeMap.get(id_uo);
    }

    getNodeMapItem(id_uo): Observable<any>{
        const item = this.nodeMap.get(id_uo).item;
        this._organization.next(item);
        return of(item);
    }

    /**
     * Getter for organization
     */
    get organization$(): Observable<any>
    {
        return this._organization.asObservable();
    }

    getTreeNodeMap(id_uo){
        return this.treeNodeMap.get(id_uo);
    }

    getAllTreeNodeMap(){
        return this.treeNodeMap;
    }

    /**
     * GET Organization Data
     */
    getOrgaData(id_uo: number): Observable<any>
    {
        if ( id_uo == 0 ) {
            return from(this._apiErp.post(
                'organigrama/EstructuraUo/listarEstructuraUo',
                {id_uo: '', node: 'id'}
            )).pipe(
                switchMap((response: any) => {
                    return of(response)
                })
            );
        }else{
            return from(this._apiErp.post(
                'organigrama/EstructuraUo/listarEstructuraUo',
                {id_uo: id_uo, node: id_uo}
            )).pipe(
                switchMap((response: any) => {
                    return of(response)
                })
            );
        }
    }


                /**
     * GET Organization Data
     */
    getOrganizationData(id_uo, item, flag): void
    {
        if (flag == 'search'){
            this.nodeMap.clear();
            this._orgaStructure.next([]);
        }

        if ( id_uo == '0' ) {
             from(this._apiErp.post(
                'organigrama/EstructuraUo/listarEstructuraUo',
                {id_uo: '', node: 'id'}
            )).subscribe(( response: any )=>{
                 const orgaStructure = response.map(item => {
                     return this._generateNode(item)
                 });
                 this._orgaStructure.next(orgaStructure);
             });/*.pipe(
                tap((response: any) => { console.warn('tap', response);
                    const orgaStructure = response.map(item => {
                        return this._generateNode(item)
                    });
                    this.orgaStructure.next(orgaStructure);
                })
            );*/
        }else{
            from(this._apiErp.post(
                'organigrama/EstructuraUo/listarEstructuraUo',
                {id_uo: id_uo, node: id_uo}
            )).subscribe(( response: any )=>{

                if (!this.nodeMap.has(id_uo)) {
                    return;
                }

                const parent = this.nodeMap.get(id_uo)!;
                const children = response!;
                if (parent.children!.length > 0) {
                    return;
                }
                const newChildrenNumber = parent.children!.length + this.batchNumber;

                const nodes = (children.slice(0, newChildrenNumber)).map(item => {
                    return this._generateNode(item);
                });
                if (newChildrenNumber < children.length) {
                    // Need a new load more node
                    nodes.push(new LoadMoreNode('LOAD_MORE', false, item));
                }
                parent.childrenChange.next(nodes);
                this._orgaStructure.next(this._orgaStructure.value);
            });
        }
    }

    private _generateTreeNode(item: any): TodoItemNode {
        if (this.treeNodeMap.has(item)) {
            return this.treeNodeMap.get(item)!;
        }
        const result = new TodoItemNode(item.id, JSON.parse(item.haschildren), item);
        this.treeNodeMap.set(item.id, result);
        return result;
    }

    private _generateNode(item: any): LoadMoreNode {

        if (this.nodeMap.has(item.id_uo)) {
            return this.nodeMap.get(item.id_uo)!;
        }
        const node = new LoadMoreNode(item.id_uo, JSON.parse(item.haschildren), item);
        this.nodeMap.set(item.id_uo, node);
        return node;
    }

    /**
     * PUT Organization Data
     */
    putOrganizationData(drag:any, drop:any): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/EstructuraUo/putOrganizationData',
            {id_uo_drag: drag.id_uo, id_uo_drop: drop.id_uo, id_uo_padre_drag: drag.id_uo_padre, id_uo_padre_drop: drop.id_uo_padre}
        )).pipe(
            switchMap((response: any) => {
                return of(response)
            })
        );

    }

    /**
     * GET Officials by office
     */
    getOfficialsByOffice(id_oficina):Observable<{ officialsList: any[]; pagination: any }>
    {
        return from(this._apiErp.post(
            'organigrama/Oficina/getOfficialsByOffice',
            {
                id_oficina
            }
        )).pipe(
            switchMap((response: any) => {
                // Clone the officials
                let officialsList: any[] | null = JSON.parse(response.datos[0].list_official);
                const sort = 'id_funcionario';
                const order = 'desc';
                const page = 0 ;
                const size = officialsList.length;


                // Sort officials
                if ( sort === 'id_funcionario' )
                {
                    officialsList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    officialsList.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = officialsList.length;//clientes.length;

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
                if ( page > lastPage )
                {
                    officialsList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    officialsList = officialsList.slice(begin, end);

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
                this._officials$.next(officialsList);

                return of({officialsList,pagination});
            })
        );

    }

    /**
     * search searchOfficialsByOffice
     * @param search
     */
    searchOfficialsByOffice(p_search = ''):Observable<{ pagination: any; officials: any[] }>
    {

        // Clone the products
        let officials: any[] | null = this._officials$.getValue();
        // Get available queries
        const search = p_search;
        const sort = 'id_funcionario';
        const order = 'asc';
        const page = 0 ;
        const size = officials.length;


        // Sort the products
        if ( sort === 'id_funcionario' )
        {
            officials.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            officials.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            officials = officials.filter(off =>
                off.funcionario.toLowerCase().includes(search.toLowerCase())
                || off.cargo.toLowerCase().includes(search.toLowerCase())

            );
        }

        // Paginate - Start
        const itemsLength = officials.length;

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
        if ( page > lastPage )
        {
            officials = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            officials = officials.slice(begin, end);

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

        return of({officials,pagination});
    }

    /**
     * GET Office
     */
    getOffices():Observable<{ pagination: any; officeList: any[] }>{

        return from(this._apiErp.post('organigrama/Oficina/listarOficina',{
            start:0,
            limit:50,
            sort:'id_oficina',
            dir:'asc'
        })).pipe(
            switchMap((response: any) => {

                // Get available queries
                const search = '';
                const sort = 'id_oficina';
                const order = 'desc';
                const page = 0 ;
                const size = response.total;
                // Clone the products
                let officeList: any[] | null =  response.datos;

                // Sort clientes
                if ( sort === 'id_oficina' )
                {
                    officeList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    officeList.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = response.total;//clientes.length;

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
                if ( page > lastPage )
                {
                    officeList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    officeList = officeList.slice(begin, end);

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
                this._offices$.next(response.datos);

                return of({officeList,pagination});
            })
        );
    }

    /**
     * search Office
     * @param search
     */
    searchOffice(p_search = ''):Observable<{ pagination: any; offices: any[] }>
    {

        // Get available queries
        const search = p_search;
        const sort = 'id_oficina';
        const order = 'desc';
        const page = 0 ;
        const size = 10000000;
        // Clone the products
        let offices: any[] | null = this._offices$.getValue();

        // Sort the products
        if ( sort === 'id_oficina' )
        {
            offices.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            offices.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            offices = offices.filter(ofi =>
                ofi.codigo?.toLowerCase().includes(search.toLowerCase())
                || ofi.nombre?.toLowerCase().includes(search.toLowerCase())
                || ofi.correo_oficina?.toLowerCase().includes(search.toLowerCase())
                || ofi.direccion?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = offices.length;

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
        if ( page > lastPage )
        {
            offices = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            offices = offices.slice(begin, end);

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

        return of({offices,pagination});
    }

    /**
     * POST Selected Organization
     */
    postSelectedOrganization(selectedUnits): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/EstructuraUo/postOrganizationChart',
            {selectedUnits: JSON.stringify(selectedUnits)}
        )).pipe(
            switchMap((response: any) => {
                return of(response)
            })
        );

    }

    /**
     * GET Selected Organization
     */
    getSelectedOrganizationChart(): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/EstructuraUo/getSelectedOrganizationChart',
            {}
        )).pipe(
            switchMap((response: any) => {
                return of(JSON.parse(response.datos[0].jsondata));
            })
        );

    }


    /**
     * Save generate lottery
     */
    generateLottery(lottery, lotteryOfDays): Observable<any>{

        return from(this._apiErp.post(
            'organigrama/SorteoPruebaPsicoActiva/generateLottery',
            {lottery,lotteryOfDays}
        )).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError((error)=>{
                return of(error);
            })
        );
    }


    /**
     * GET lottery of days
     */
    getLotteryOfDays():Observable<{ pagination: any; lotteryList: any[]; selectedList: any }>{

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getLotteryOfDays',{
            start:0,
            limit:50,
            sort:'id_control_sorteo_prueba',
            dir:'desc'
        })).pipe(
            switchMap((response: any) => {

                let lotteryList: any[] | null =  JSON.parse(response.datos[0].jsondata).lottery_list;
                let selectedList: any[] | null =  JSON.parse(response.datos[0].jsondata).selected_list;
                // Get available queries
                const search = '';
                const sort = 'id_control_sorteo_prueba';
                const order = 'desc';
                const page = 0 ;
                const size = lotteryList.length;
                // Clone the products

                // Sort clientes
                if ( sort === 'id_control_sorteo_prueba' )
                {
                    lotteryList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    lotteryList.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = lotteryList.length;

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
                if ( page > lastPage )
                {
                    lotteryList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    lotteryList = lotteryList.slice(begin, end);

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
                this._lottery$.next(lotteryList);
                this._selected$.next(selectedList);

                return of({selectedList,lotteryList,pagination});
            })
        );
    }

    /**
     * GET lottery of days
     */
    searchLotteryOfDays(p_search = ''):Observable<{ pagination: any; lotteryList: any[]; /*selectedList: any*/ }>{



        let lotteryList: any[] | null =  this._lottery$.getValue();
        //let selectedList: any[] | null =  JSON.parse(response.datos[0].jsondata).selected_list;
        // Get available queries
        const search = p_search;
        const sort = 'id_control_sorteo_prueba';
        const order = 'desc';
        const page = 0 ;
        const size = 10000000;
        // Clone the products

        // Sort clientes
        if ( sort === 'id_control_sorteo_prueba' )
        {
            lotteryList.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            lotteryList.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            lotteryList = lotteryList.filter(lot =>
                lot.official?.toLowerCase().includes(search.toLowerCase())
                || lot.nro_tramite?.toLowerCase().includes(search.toLowerCase())
                || lot.estado?.toLowerCase().includes(search.toLowerCase())
                || lot.generation_date?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = lotteryList.length;

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
        if ( page > lastPage )
        {
            lotteryList = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            lotteryList = lotteryList.slice(begin, end);

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

        return of({lotteryList,pagination});
    }

    /**
     * Getter for courses
     */
    get lottery$(): Observable<any[]>
    {
        return this._lottery$.asObservable();
    }

    /**
     * GET detail officials
     */
    getDetailsOfficials(id_uo):Observable<{ pagination: any; officialsList: any[]; information: any; }>{

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getDetailsOfficials',
            {id_uo}
            )).pipe(
            switchMap((response: any) => {
                const jsonData = JSON.parse(response.datos[0].jsondata);

                let information = {name: jsonData.name, date: jsonData.date};
                let officialsList: any[] | null =  jsonData.officials;
                // Get available queries
                const search = '';
                const sort = 'official';
                const order = 'asc';
                const page = 0 ;
                const size = officialsList.length;
                // Clone the products
                // Sort clientes
                if ( sort === 'official' )
                {
                    officialsList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    officialsList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = officialsList.length;

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
                if ( page > lastPage )
                {
                    officialsList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    officialsList = officialsList.slice(begin, end);

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
                this._officials$.next(officialsList);

                return of({pagination,officialsList,information});
            })
        );
    }

    /**
     * GET detail officials
     */
    searchDetailsOfficials(p_search = ''):Observable<{ pagination: any; officialsList: any[]; }>{


        let officialsList: any[] | null =  this._officials$.getValue();
        // Get available queries
        const search = p_search;
        const sort = 'official';
        const order = 'asc';
        const page = 0 ;
        const size = 10000000;
        // Clone the products

        // Sort clientes
        if ( sort === 'official' )
        {
            officialsList.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            officialsList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            officialsList = officialsList.filter(ofi =>
                ofi.official?.toLowerCase().includes(search.toLowerCase())
                || ofi.office?.toLowerCase().includes(search.toLowerCase())
                || ofi.ocupation?.toLowerCase().includes(search.toLowerCase())
                || ofi.place?.toLowerCase().includes(search.toLowerCase())
                || ofi.unit?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = officialsList.length;

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
        if ( page > lastPage )
        {
            officialsList = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            officialsList = officialsList.slice(begin, end);

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
        return of({officialsList,pagination});

    }

    /**
     * GET Test Type
     */
    getTestType():Observable<{ pagination: any; testTypeList: any[]; }>{

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getTestType',
            {}
        )).pipe(
            switchMap((response: any) => {
                let testTypeList: any[] | null =  JSON.parse(response.datos[0].jsondata);
                // Get available queries
                const search = '';
                const sort = 'nombre';
                const order = 'asc';
                const page = 0 ;
                const size = testTypeList.length;
                // Clone the products

                // Sort clientes
                if ( sort === 'nombre' )
                {
                    testTypeList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    testTypeList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = testTypeList.length;

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
                if ( page > lastPage )
                {
                    testTypeList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    testTypeList = testTypeList.slice(begin, end);

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
                this._testType$.next(testTypeList);

                return of({testTypeList,pagination});
            }),
            catchError(error => {
                return of(error);
            })
        );
    }

    /**
     * SEARCH Test Type
     */
    searchTestType(p_search):Observable<{ pagination: any; testTypeList: any[]; }>{

        let testTypeList: any[] | null =  this._testType$.getValue();
        // Get available queries
        const search = p_search;
        const sort = 'nombre';
        const order = 'asc';
        const page = 0 ;
        const size = 100000000;
        // Clone the products

        // Sort clientes
        if ( sort === 'nombre' )
        {
            testTypeList.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            testTypeList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            testTypeList = testTypeList.filter(ofi =>
                ofi.nombre?.toLowerCase().includes(search.toLowerCase())
                || ofi.tipo?.toLowerCase().includes(search.toLowerCase())
                || ofi.procedimiento?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = testTypeList.length;

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
        if ( page > lastPage )
        {
            testTypeList = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            testTypeList = testTypeList.slice(begin, end);

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
        return of({testTypeList,pagination});
    }

    /**
     * POST, PUT test type
     */
    postTestType(testType): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/postTestType', {testType: JSON.stringify(testType)})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    /**
     * DELETE test type
     */
    deleteTestType(id_tipo_prueba): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/deleteTestType', {id_tipo_prueba}))
            .pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    return of(resp.ROOT);
                }),
                catchError(error=>{
                    return of(error);
                })
        );
    }

    /**
     * DELETE lottery
     */
    deleteLottery(id_control_sorteo_prueba): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/deleteLottery', {id_control_sorteo_prueba}))
            .pipe(
                switchMap((resp: any) => {
                    // Return a new observable with the response
                    return of(resp);
                }),
                catchError(error=>{
                    return of(error);
                })
            );
    }

    /**
     * GET official
     */
    getOfficialGenerator(): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/SorteoPruebaPsicoActiva/getOfficialGenerator',
            {}
        )).pipe(
            switchMap((response: any) => {
                return of(JSON.parse(response.datos[0].jsondata));
            })
        );

    }

    /**
     * POST, PUT test type
     */
    postTestOfficial(testOfficial, selectedOfficial, archivo: File, imageSrc: any): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/postTestOfficial', {
            testOfficial: JSON.stringify(testOfficial),
            id: selectedOfficial.id,
            ci: selectedOfficial.ci,
            id_funcionario: selectedOfficial.id_funcionario,
            archivo: imageSrc,
            extension: archivo?.name?.split('.')[1] || ''
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    /**
     * PUT checked selection
     */
    checkedSelection (id, expandable, checked): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/checkedSelection', {
            id,
            expandable,
            checked
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    getPeriod(): Observable<any>{
        return from(this._apiErp.post(
            'parametros/Periodo/listarPeriodo',
            {
                gestion_actual: 'current',
                start:0,
                limit:50,
                sort:'periodo',
                dir:'asc'
            }
        )).pipe(
            switchMap((response: any) => {
                return of(response);
            }),
            catchError(error => {
                return of(error);
            })
        );
    }

    /**
     * Upload file to server
     */
    onUploadFile(id: any, id_funcionario: any, archivo: File, imageSrc: any): Observable<any>
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/uploadFile',{
            id,
            id_funcionario,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1]
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    /**
     * GET Officials
     */
    getOfficials():Observable<{ officialsList: any[]; pagination: any }>
    {
        return from(this._apiErp.post(
            'organigrama/Funcionario/listarFuncionario',
            {
                start: 0,
                limit: 50,
                sort: 'PERSON.nombre_completo2',
                dir:'asc',
                estado_func:'activo'
            }
        )).pipe(
            switchMap((response: any) => {
                // Clone the officials
                let officialsList: any[] | null = response.datos;
                const sort = 'id_funcionario';
                const order = 'desc';
                const page = 0 ;
                const size = officialsList.length;


                // Sort officials
                if ( sort === 'id_funcionario' )
                {
                    officialsList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'desc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    officialsList.sort((a, b) => order === 'desc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = officialsList.length;//clientes.length;

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
                if ( page > lastPage )
                {
                    officialsList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    officialsList = officialsList.slice(begin, end);

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
                //this._officials$.next(officialsList);

                return of({officialsList,pagination});
            })
        );

    }

    /**
     * GET test official
     */
    getTestOfficial(id_funcionario):Observable<{ pagination: any; officialList: any[]; }>{

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getTestOfficial',
            {id_funcionario}
        )).pipe(
            switchMap((response: any) => {
                let officialList: any[] | null =  JSON.parse(response.datos[0].jsondata);
                // Get available queries
                const search = '';
                const sort = 'official';
                const order = 'asc';
                const page = 0 ;
                const size = officialList.length;
                // Clone the products

                // Sort clientes
                if ( sort === 'official' )
                {
                    officialList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    officialList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = officialList.length;

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
                if ( page > lastPage )
                {
                    officialList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    officialList = officialList.slice(begin, end);

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
                //this._lottery$.next(officialsList);

                return of({officialList,pagination});
            })
        );
    }

    putTestOfficial (testOfficial, selectedOfficial, archivo: File, imageSrc: any){
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/putTestOfficial', {
            testOfficial: JSON.stringify(testOfficial),
            id: selectedOfficial.id,
            id_funcionario: selectedOfficial.id_funcionario,
            archivo: imageSrc,
            extension: archivo.name.split('.')[1]
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    savePlanning(id_control_sorteo_prueba, lottery_of_days){
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/putPlanning', {
            id_control_sorteo_prueba: id_control_sorteo_prueba,
            lottery_of_days: JSON.stringify(lottery_of_days)
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    saveModifiedPlanning(id_control_sorteo_prueba, lottery_of_days, deleted_plan, schedules, action){
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/putModifiedPlanning', {
            id_control_sorteo_prueba: id_control_sorteo_prueba,
            lottery_of_days: JSON.stringify(lottery_of_days),
            deleted_plan: JSON.stringify(deleted_plan),
            schedules: JSON.stringify(schedules),
            action
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    enablePlanning( id_control_sorteo_prueba ){
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/enablePlanning', {
            id_control_sorteo_prueba
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    /**
     * filter By Query
     */
    filterByQuery(query, start, limit): Observable<any[]>
    {

        return from(this._apiErp.post('reclamo/Reclamo/getClaimsList',{
            start,
            limit,
            query,
            par_filtro:'rec.nro_tramite#rec.correlativo_preimpreso_frd#rec.nro_frd#c.nombre_completo2#rec.nro_vuelo#usu1.cuenta'
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            }),
            catchError(error=>{
                return of(error)
            })
        );

    }

    /**
     * GET Organizational Units
     */
    getOrganizationalUnits(): Observable<any[]>
    {

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getOrganizationalUnits',{})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].djson));
            }),
            catchError(error=>{
                return of(error)
            })
        );

    }

    /**
     * search organizational units
     */
    searchOrganizationalUnits(query: string, start, limit): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/Uo/listarUo',{
            start,
            limit,
            query,
            par_filtro:'UO.codigo#UO.descripcion#UO.nombre_cargo#UO.nombre_unidad',
            sort:'nombre_unidad',
            dir:'asc',
            estado_reg: 'activo'
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            }),
            catchError(error=>{
                return of(error)
            })
        );

    }

    psychoactiveProgramReport(id_proceso_wf: number, action: string)
    {
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/psychoactiveProgramReport', {id_proceso_wf, action})).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp);
            })
        );
    }

    getYear(): Observable<any>{
        return from(this._apiErp.post('parametros/Gestion/listarGestion',{
            start:0,
            limit:50,
            sort:'gestion',
            dir:'desc'
        })).pipe(
            switchMap((response: any) => {
                // Return a new observable with the response
                return of(response.datos);
            })
        );
    }
    getMonth(id_gestion: number): Observable<any>{

        return from(this._apiErp.post('parametros/Periodo/listarPeriodo',{
            start:0,
            limit:50,
            id_gestion:id_gestion
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(resp.datos);
            })
        );
    }
    getDay(id_periodo: number): Observable<any>{

        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getDay',{
            start:0,
            limit:50,
            id_periodo
        })).pipe(
            switchMap((resp: any) => {
                // Return a new observable with the response
                return of(JSON.parse(resp.datos[0].djson));
            })
        );
    }

    /**
     * GET lottery of days
     */
    getTestQuery(params):Observable<{ pagination: any; queryList: any[]; }>{
        return from(this._apiErp.post('organigrama/SorteoPruebaPsicoActiva/getTestQuery',{
            start:0,
            limit:50,
            sort:'official',
            dir:'asc',
            params: JSON.stringify(params)
        })).pipe(
            switchMap((response: any) => {

                let queryList: any[] | null =  JSON.parse(response.datos[0].jsondata);
                // Get available queries
                const search = '';
                const sort = 'official';
                const order = 'asc';
                const page = 0 ;
                const size = queryList.length;
                // Clone the products

                // Sort clientes
                if ( sort === 'official' )
                {
                    queryList.sort((a, b) => {
                        const fieldA = a[sort].toString().toUpperCase();
                        const fieldB = b[sort].toString().toUpperCase();
                        return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
                    });
                }
                else
                {
                    queryList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
                }

                // Paginate - Start
                const itemsLength = queryList.length;

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
                if ( page > lastPage )
                {
                    queryList = null;
                    pagination = {
                        lastPage
                    };
                }
                else
                {
                    // Paginate the results by size
                    queryList = queryList.slice(begin, end);

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
                this._testQuery$.next(queryList);

                return of({pagination,queryList});
            }),
            catchError(error=>{
                return of(error)
            })
        );
    }

    /**
     * SEARCH Test Query
     */
    searchTestQuery(p_search):Observable<{ pagination: any; queryList: any[]; }>{

        let queryList: any[] | null =  this._testQuery$.getValue();
        // Get available queries
        const search = p_search;
        const sort = 'official';
        const order = 'asc';
        const page = 0 ;
        const size = 100000000;
        // Clone the products

        // Sort clientes
        if ( sort === 'official' )
        {
            queryList.sort((a, b) => {
                const fieldA = a[sort].toString().toUpperCase();
                const fieldB = b[sort].toString().toUpperCase();
                return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
            });
        }
        else
        {
            queryList.sort((a, b) => order === 'asc' ? a[sort] - b[sort] : b[sort] - a[sort]);
        }

        // If search exists...
        if ( search )
        {
            // Filter the products
            queryList = queryList.filter(ofi =>
                ofi.official?.toLowerCase().includes(search.toLowerCase())
                || ofi.office?.toLowerCase().includes(search.toLowerCase())
                || ofi.ocupation?.toLowerCase().includes(search.toLowerCase())
                || ofi.place?.toLowerCase().includes(search.toLowerCase())
                || ofi.unit?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Paginate - Start
        const itemsLength = queryList.length;

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
        if ( page > lastPage )
        {
            queryList = null;
            pagination = {
                lastPage
            };
        }
        else
        {
            // Paginate the results by size
            queryList = queryList.slice(begin, end);

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
        return of({pagination,queryList});

    }

    /**
     * Post orga
     */
    createOrga(): Observable<any>
    {
        return from(this._apiErp.post('organigrama/Uo/getOrgaId', {})).pipe(
            switchMap((resp: any) => {
                const newOrga = {
                    id_uo: resp.data.id_uo,
                    codigo: '',
                    id_nivel_organizacional: '',
                    nombre_unidad: '',
                    descripcion: '',
                    nombre_cargo: '',
                    cargo_individual: '',
                    presupuesta: '',
                    nodo_base: '',
                    correspondencia: '',
                    gerencia: ''
                };
                // Update the organizations with the new organization
                //this._items.next([newItem, ...this._items.getValue()]);
                // Return the new organization
                return of(newOrga);
            })
        );

    }

    /*searchOrganizationChart( query ): Observable <any []>{
        from(this._apiErp.post(
            'organigrama/EstructuraUo/listarEstructuraUo',
            {filtro : 'activo',criterio_filtro_arb : query, id_uo : '', node : 'id'}
        )).subscribe(( response: any )=>{

            if (!this.nodeMap.has('10')) {
                return;
            }

            const parent = this.nodeMap.get('10')!;

            const children = response!;

            if (parent.children!.length > 0) {
                return;
            }
            const newChildrenNumber = parent.children!.length + this.batchNumber;

            const nodes = (children.slice(0, newChildrenNumber)).map(item => {

                return this._generateNode(item);
            });
            if (newChildrenNumber < children.length) {
                // Need a new load more node

                nodes.push(new LoadMoreNode('LOAD_MORE', false, {}));
            }

            parent.childrenChange.next(nodes);

            this._orgaStructure.next(this._orgaStructure.value);


        });

        return of([]);
    }*/

    searchOrganizationChart( query ): Observable<any>{

        if ( this._orgaStructure.getValue().length > 0 ){
            this.nodeMap.clear();
            this._orgaStructure.next([]);
        }
        return this._httpClient.get<any[]>('api/apps/human-talent/searchOrganizationChart',{params: {query}}).pipe(
            tap((response: any) => {
                for( let index = 0 ; index < response.datos.length ; index++ ) {

                    if ( index == 0 ){
                        const orgaStructure = this._generateNode(response.datos[index]);

                        this._orgaStructure.next([orgaStructure]);
                    }else {
                        if (!this.nodeMap.has(response.datos[index-1].id_uo)) {
                            return;
                        }

                        const parent = this.nodeMap.get(response.datos[index-1].id_uo)!;

                        if (parent.children!.length > 0) {
                            return;
                        }

                        const nodes = this._generateNode(response.datos[index]);

                        parent.childrenChange.next([nodes]);

                        this._orgaStructure.next(this._orgaStructure.value);
                    }
                }
            })
        );

        /*from(this._apiErp.post(
            'organigrama/EstructuraUo/searchOrganizationChart',
            { query }
        )).subscribe(( response: any )=>{
            const datos = JSON.parse(response.data.orga_json);
            for( let index = 0 ; index < datos.length ; index++ ) {

                if ( index == 0 ){
                    const orgaStructure = this._generateNode(datos[index]);

                    this._orgaStructure.next([orgaStructure]);
                }else {
                    if (!this.nodeMap.has(datos[index-1].id_uo)) {
                        return;
                    }

                    const parent = this.nodeMap.get(datos[index-1].id_uo)!;

                    if (parent.children!.length > 0) {
                        return;
                    }

                    const nodes = this._generateNode(datos[index]);

                    parent.childrenChange.next([nodes]);

                    this._orgaStructure.next(this._orgaStructure.value);
                }
            }

        });*/
    }

    /**
     * GET Organization Chart Data
     */
    /*getOrgaChartData(id_uo, item):  Observable<any []> {

        if ( id_uo == '0' ) { console.warn('TOM');
            return from(this._apiErp.post(
                'organigrama/EstructuraUo/getOrganizationChartJson',
                {id_uo: '', node: 'id'}
            )).pipe(
                switchMap( (response: any ) => {
                    let djson = JSON.parse(response.datos[0].djson);
                    this._orgaChartData.next(djson);
                    return of(djson);
                }),
                catchError(error =>{
                    return of(error);
                })
            );
        }else{ console.warn('BOBY');
            return from(this._apiErp.post(
                'organigrama/EstructuraUo/getOrganizationChartJson',
                {id_uo: id_uo, node: id_uo}
            )).pipe(
                switchMap( (response: any ) => {
                    //console.warn('VANE',response);
                    let djson = JSON.parse(response.datos[0].djson);

                    console.warn('djson',djson);

                    let node = this._orgaChartData.getValue();
                    console.warn('children',node);
                    node[0].children = djson;
                    this._orgaChartData.next(node);
                    return of(node);
                }),
                catchError(error =>{
                    return of(error);
                })
            );
        }

    }*/

    getOrgaChartData(id_uo, item):  void {

        if ( id_uo == '0' ) {
            from(this._apiErp.post(
                'organigrama/EstructuraUo/getOrganizationChartJson',
                {id_uo: '', node: 'id'}
            )).subscribe( (response: any ) => {
                    let djson = JSON.parse(response.datos[0].djson);
                    this._orgaChartData.next(djson);
                });
        }else{
            from(this._apiErp.post(
                'organigrama/EstructuraUo/getOrganizationChartJson',
                {id_uo: id_uo, node: id_uo}
            )).subscribe( (response: any ) => {
                    let djson = JSON.parse(response.datos[0].djson);

                    let node = this._orgaChartData.getValue();
                    node[0].children = djson;
                    this._orgaChartData.next(node);
                });
        }

    }

    searchOrgaChart( query ): Observable<any []>{
        return from(this._apiErp.post(
            'organigrama/EstructuraUo/searchOrganizationChart',
            { query }
        )).pipe(
            switchMap( (response: any ) => {
                return of(JSON.parse(response.data.orga_chart));
            }),
            catchError(error =>{
                return of(error);
            })
        );

    }

    /**
     * Get roles by official
     */
    getModulesByRoles(modules): Observable<any[]>
    {
        return from(this._apiErp.post('organigrama/HumanTalent/getModulesByRoles',{
            modules: JSON.stringify(modules)
        })).pipe(
            switchMap((modules: any) => {
                return of(modules);
            }),
            catchError(error =>{
                return of(error);
            })

        );
    }

    /**
     * POST Selected Organization
     */
    postUnitOrder(node): Observable<any>
    {
        return from(this._apiErp.post(
            'organigrama/EstructuraUo/postUnitOrder',
            {node: JSON.stringify(node)}
        )).pipe(
            switchMap((response: any) => {
                return of(response)
            })
        );

    }

    loadCargoPresupuesto(id_uo){
        return from(this._apiErp.post(
            'organigrama/Cargo/loadCargoPresupuesto',
            {id_uo: id_uo}
        )).pipe(
            switchMap((response: any) => {
                return of(response.data)
            })
        );
    }

    postOrganization(orga, statusOrga): Observable<any>{
        return of('');
    }
}
