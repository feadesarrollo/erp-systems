import { ChangeDetectionStrategy, /*ChangeDetectorRef,*/ Component, OnInit, ViewEncapsulation } from '@angular/core';
/*import { TreeNode } from "primeng/api";
import { HumanTalentService } from "../../human-talent.service";
import { FormControl } from "@angular/forms";
import { FlatTreeControl } from "@angular/cdk/tree";
import { LeafNode, LoadMoreNode } from "../../human-talent.types";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { FoodNode } from "../../../claims-management/settings/settings.type";
import {debounceTime, filter, switchMap, takeUntil} from 'rxjs/operators';
import { fromEvent, Observable, Subject, BehaviorSubject } from 'rxjs';*/

@Component({
    selector: 'erp-organization-chart',
    templateUrl: './organization-chart.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationChartComponent implements OnInit {
    constructor() { }

    ngOnInit(): void {
    }
    /*orga: TreeNode[];

    public loading: boolean;
    public searchInputControl: FormControl = new FormControl();
    public displayedColumns: string[] = ['accion','icono','nombre_unidad', 'cargo_individual', 'presupuesta', 'correspondencia', 'gerencia'];
    public cols = [
        { field: 'nombre_unidad', header: 'Nombre Unidad', width: 'min-w-1/2'},
        { field: 'cargo_individual', header: 'Cargo Individual', width: 'min-w-32'},
        { field: 'presupuesta', header: 'Presupuesta', width: 'min-w-32'},
        { field: 'correspondencia', header: 'Correspondencia', width: 'min-w-32'},
        { field: 'gerencia', header: 'Gerencia', width: 'min-w-32'},

    ];

    public selectedNode: any;
    public dragDisabled = true;

    private nodes : any[];
    private totalRecords: number;
    _treeStructure$ = new BehaviorSubject<FoodNode[]>([]);

    //nodeMap = new Map<any, LeafNode>();

    nodeMap = new Map<string, LeafNode>();

    treeControl: FlatTreeControl<LeafNode>;
    treeFlattener: MatTreeFlattener<LoadMoreNode, LeafNode>;
    // Flat tree data source
    dataSource: MatTreeFlatDataSource<LoadMoreNode, LeafNode>;

    expandedNode: any;

    /!*treeControl = new FlatTreeControl<LeafNode>(node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);*!/

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {
        this.treeControl = new FlatTreeControl<LeafNode>(this.getLevel, this.isExpandable);

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this._htService.getOrganizationData('0',{},'query');

        this._htService._orgaStructure.subscribe((data) => {

            this.dataSource.data = data;

            if ( !this.searchInputControl.value ) { //console.warn('IF', data);
                if (!this.treeControl.isExpanded(this.expandedNode) && this.expandedNode) {

                    let parent = null;

                    let index = this.treeControl.dataNodes.findIndex((n) => n === this.expandedNode);

                    for (let i = index; i >= 0; i--) {
                        if (this.expandedNode.level > this.treeControl.dataNodes[i].level) {
                            parent = this.treeControl.dataNodes[i];
                            break;
                        }
                    }

                    if (parent) {
                        this.treeControl.collapseDescendants(parent);
                        this.treeControl.expand(parent);
                    } else {
                        this.treeControl.collapseAll();
                    }
                    this.treeControl.expand(this.expandedNode);
                } else {

                    this.treeControl.collapse(this.expandedNode);
                }
            }else{

                if ( this.searchInputControl.value ) {
                    this.treeControl.expandAll();
                }
            }

            this._changeDetectorRef.markForCheck();
        });

    }

    transformer = (node: LoadMoreNode, level: number) => {
        const existingNode = this.nodeMap.get(node.item.id_uo);

        if (existingNode) {
            return existingNode;
        }

        const newNode = new LeafNode(node.item.id_uo, level, node.hasChildren, node.item, node.loadMoreParentItem);

        this.nodeMap.set(node.item.id_uo, newNode);

        return newNode;
    };

    getChildren = (node: LoadMoreNode): Observable<LoadMoreNode[]> => node.childrenChange;

    getLevel = (node: LeafNode) => node.level;

    isExpandable = (node: LeafNode) => node.expandable;

    /!**
     * The following methods are for persisting the tree expand state
     * after being rebuilt
     *!/

    rebuildTreeForData(data: any) {
        //console.warn('rebuildTreeForData', data);
        this.dataSource.data = data;
        this._changeDetectorRef.markForCheck();
    }

    ngOnInit(): void {


        this.loading = true;

        // Subscribe to search input field value changes
        /!*this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query =>
                    // Search
                    this._htService.searchOrganizationChart(query)
                )
            ).subscribe();*!/


        this.searchInputControl.valueChanges
            .pipe(debounceTime(5000))
            .subscribe(query => {
                console.warn('searchInputControl',this.searchInputControl.value);
                if (!this.searchInputControl.value){ console.warn('IF searchInputControl');
                    this._htService.getOrganizationData('0',{},'search');
                }else { console.warn('ELSE searchInputControl');
                    this._htService.searchOrganizationChart(query);
                }
            });

    }

    loadChildren(node) {
        this.expandedNode = node;
        const childrenNode = this._htService.getNodeMap(node.id).childrenChange.getValue();

        if (this.treeControl.isExpanded(node)) {
            this.treeControl.collapse(node);
        }else{
            if ( childrenNode.length > 0 ) {
                this.treeControl.expand(node);
            }else{
                if ( !this.searchInputControl.value ) {
                    this._htService.getOrganizationData(node.id, node.item,'query');
                }

            }
        }
    }

    nodeClicked(node) {
        this.expandedNode = node;
        console.warn('nodeClicked', node);
        console.warn('dataNodes', this.treeControl.dataNodes);
        //this.treeControl.expand(node);

        const childrenNode = this._htService.getNodeMap(node.id).childrenChange.getValue();
        //this._htService.getOrganizationData(node.id, node.item);

        if (this.treeControl.isExpanded(node)) {
            /!*let parent = null;

            let index = this.treeControl.dataNodes.findIndex((n) =>  n === node );

            for (let i = index; i >= 0; i--) {
                if (node.level > this.treeControl.dataNodes[i].level) {
                    parent = this.treeControl.dataNodes[i];
                    break;
                }
            }

            if(parent){
                this.treeControl.collapseDescendants(parent);
                this.treeControl.expand(parent);
            } else {
                this.treeControl.collapseAll()
            }*!/
            this.treeControl.collapse(node);
        }else{
            if ( childrenNode.length > 0 ) {
                this.treeControl.expand(node);
            }else{
                this._htService.getOrganizationData(node.id, node.item,'query');
            }
        }
    }

    drop(event: CdkDragDrop<string[]>) {

    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                break;
            case 'eliminar':
                break;
            case 'exportar':
                break;
        }
    }

    onNodeExpand(event) {

        this.loading = true;
        /!*this._htService.getOrganizationData(event.node.data.id_uo).subscribe((resp)=>{
                const children = [];
                this.loading = false;
                const node = event.node;
                for(let i = 0; i < resp.length; i++) {
                    let node = {
                        data:resp[i],
                        leaf: !resp[i].node_type,
                        expandedIcon: 'pi pi-folder-open',
                        collapsedIcon: 'pi pi-folder'
                    };
                    children.push(node);
                }

                node.children = children;

                this.orga = [...this.orga];
            }
        );*!/
    }

    onDrop(event) {
        let drag = event.dragNode.data;
        let drop = event.dropNode.data;

        this._htService.putOrganizationData(drag, drop).subscribe((resp)=>{

        });

    }*/

}
