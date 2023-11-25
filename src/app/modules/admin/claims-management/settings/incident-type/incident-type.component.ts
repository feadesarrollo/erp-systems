import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl } from "@angular/forms";
import { MatTable } from '@angular/material/table';
import { SettingsService } from "../settings.service";
import { BehaviorSubject } from 'rxjs';
import { TreeNode, IncidentTypeNode, FoodNode, ExampleFlatNode } from '../settings.type';
//import { TreeNode, IncidentTypeNode} from '../settings.type';
import {SelectionModel} from "@angular/cdk/collections";

/*interface FoodNode {
    name: string;
    count?: number;
    children?: FoodNode[];
}

interface ExampleFlatNode {
    expandable: boolean;
    name: string;
    count: number;
    level: number;
}

const TREE_DATA: FoodNode[] = [
    {
        name: 'Fruit',
        children: [
            {name: 'Apple', count: 10},
            {name: 'Banana', count: 20},
            {name: 'Fruit loops', count: 30},
        ]
    }, {
        name: 'Vegetables',
        children: [
            {
                name: 'Green',
                children: [
                    {name: 'Broccoli', count: 10},
                    {name: 'Brussel sprouts', count: 20},
                ]
            }, {
                name: 'Orange',
                children: [
                    {name: 'Pumpkins', count: 30},
                    {name: 'Carrots', count: 40},
                ]
            },
        ]
    },
];*/



@Component({
    selector: 'erp-incident-type',
    templateUrl: './incident-type.component.html',
    styleUrls: ['./incident-type.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentTypeComponent implements OnInit {

    displayedColumns: string[] = ['position','nombre_incidente', 'tiempo_respuesta'];
    //displayedColumns: string[] = ['position','name', 'count'];
    dragDisabled = true;
    //@ViewChild('table', { static: true }) table: MatTable<any>;
    searchInputControl: FormControl = new FormControl();
    selectedTipoIncidente: any = {};

    files: TreeNode[];
    totalRecords: number;
    loading: boolean;

    nodes : ExampleFlatNode[];

    _treeStructure$ = new BehaviorSubject<FoodNode[]>([]);
    expansionModel = new SelectionModel<string>(true);

    constructor(private _settingS: SettingsService,
                private _changeDetectorRef: ChangeDetectorRef) {
        //this.dataSource.data = TREE_DATA;

        this.loadNodes();
        this._treeStructure$.subscribe(data => {
            this.rebuildTreeForData(data)
        });
    }

    rebuildTreeForData(data: any) {
        this.dataSource.data = [...this.dataSource.data];
        /*this.expansionModel.selected.forEach((data) => {
            console.warn('rebuildTreeForData', data)
            /!*const node = this.treeControl.dataNodes.find((n) => n.data.id_tipo_incidente === id_tipo_incidente);
            this.treeControl.expand(node);*!/
        });*/
    }

    /*nodeClicked(node){
        console.warn('isExpanded', this.treeControl.isExpanded(node));
        this.treeControl.toggle(node);
        console.warn('this.treeControl.dataNodes', this.treeControl.dataNodes);
    }*/

    loadChildren(node) {

        if ( !this.treeControl.isExpanded(node) ) {
            this.treeControl.toggle(node);
            this._settingS.getTipoIncidente(node.data.id_tipo_incidente).subscribe((resp) => {

                    const treeStructure = this._treeStructure$.getValue();
                    const children = [];
                    this.loading = false;
                    for (let i = 0; i < resp.length; i++) {
                        let node = {
                            data: resp[i],
                            expandable: JSON.parse(resp[i].haschildren),
                            level: +resp[i].nivel
                        };
                        children.push(node);
                    }

                    const data = treeStructure.find(item => item.data.id_tipo_incidente === node.data.id_tipo_incidente);
                    data.children = children;
                    node.children = children;
                    this._treeStructure$.next(this._treeStructure$.getValue());

                    //this._treeStructure$.next(this.nodes);
                    //this.dataSource.data = this._treeStructure$.getValue();
                    //this.nodes = [...this.nodes];
                    this.treeControl.toggle(node);
                    this.treeControl.expand(node);
                    //this.dataSource.data = [...this.dataSource.data];//this._treeStructure$.getValue();

                    /******************** ***********************/
                    /*let parent = null;

                    let index = this.treeControl.dataNodes.findIndex((n) => {
                        console.error('n', n);
                        return n === node;
                    });
                    console.error('index', index);
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
                    }
                    this.treeControl.expand(node);*/
                    /******************** ***********************/

                    //this._changeDetectorRef.markForCheck();

                }

            );
        }else{
            //this.treeControl.collapse(node);
        }

        /*if (this.treeControl.isExpanded(node)) { console.warn('IF');
            //this.treeControl.collapse(node);
            let parent = null;

            let index = this.treeControl.dataNodes.findIndex((n) => n === node);

            for (let i = index; i >= 0; i--) {
                if (node.level > this.treeControl.dataNodes[i].level) {
                    parent = this.treeControl.dataNodes[i];
                    break;
                }
            }

            if(parent){
                this.treeControl.collapseDescendants(parent);
                this.treeControl.expand(parent);
            } else { console.error('collapseAll');
                this.treeControl.collapseAll()
            }
            this.treeControl.expand(node);
        }else{ console.warn('ELSE');
            this.treeControl.toggle(node);
        }*/
    }

    loadNodes() {
        this.loading = true;

        //in a production application, make a remote request to load data using state metadata from event
        //event.first = First row offset
        //event.rows = Number of rows per page
        //event.sortField = Field name to sort with
        //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
        //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

        this._settingS.getTipoIncidente('0').subscribe(
            (resp) => {

                this.nodes = [];
                this.totalRecords += resp.length;
                for(let i = 0; i < resp.length; i++) {
                    let node = {
                        data: resp[i],
                        expandable: true,
                        level: +resp[i].nivel
                    };
                    this.nodes.push(node);
                }
                this._treeStructure$.next(this.nodes);
                this.dataSource.data = this._treeStructure$.getValue();

            }
        );
    }

    /*private transformer = (node: FoodNode, level: number) => {
        console.error('transformer => node',node);
        console.error('transformer => level',level);
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            count: node.count,
            level: level,
        };
    };*/

    private transformer = (node: FoodNode, level: number) => {
        return {
            expandable: JSON.parse(node.data.haschildren),//!!node.children && node.children.length > 0,
            data: node.data,
            level: level
        };
    };

    treeControl = new FlatTreeControl<ExampleFlatNode>(node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

    drop(event: CdkDragDrop<string[]>) {
        this.dragDisabled = true;

        const previousIndex = this.dataSource.data.findIndex((d) => d === event.item.data);

        moveItemInArray(this.dataSource.data, previousIndex, event.currentIndex);
        //this.table.renderRows();
    }

    ngOnInit(): void {
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                //this.editCliente(this.selectedCliente);
                break;
            case 'eliminar':
                //this.deleteCliente(this.selectedCliente);
                break;
            case 'exportar':
                break;
        }
    }

}
