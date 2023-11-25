import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FlatTreeControl } from "@angular/cdk/tree";
import { hojaNode, ramaNode } from "../../human-talent.types";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { HumanTalentService } from "../../human-talent.service";
import { FormControl } from '@angular/forms';
import { debounceTime } from "rxjs/operators";

@Component({
    selector: 'erp-organigrama',
    templateUrl: './organigrama.component.html',
    styleUrls: ['./organigrama.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganigramaComponent implements OnInit {

    treeControl: FlatTreeControl<hojaNode>;
    treeFlattener: MatTreeFlattener<ramaNode, hojaNode>;
    dataSource: MatTreeFlatDataSource<ramaNode, hojaNode>;
    public searchInputControl: FormControl = new FormControl();

    public displayedColumns: string[] = ['icono','nombre_unidad','cargo_individual','presupuesta','correspondencia','gerencia'];
    public cols = [
        { field: 'nombre_unidad', header: 'Nombre Unidad', width: 'min-w-1/2'},
        { field: 'cargo_individual', header: 'Cargo Individual', width: 'min-w-32'},
        { field: 'presupuesta', header: 'Presupuesta', width: 'min-w-32'},
        { field: 'correspondencia', header: 'Correspondencia', width: 'min-w-32'},
        { field: 'gerencia', header: 'Gerencia', width: 'min-w-32'}

    ];
    public selectedNode: any;
    constructor(
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {

        this.treeControl = new FlatTreeControl<hojaNode>(node => node.level,node => node.expandable);
        this.treeFlattener = new MatTreeFlattener(this.transformer,node => node.level,node => node.expandable,node => node.children);

        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    }

    ngOnInit(): void {
        this.dataSource.data = [];
        this._htService.getOrgaChartData('0',{});


        this._htService._orgaChartData.subscribe((data) => {
            this.dataSource.data = data;
            this.treeControl.expandAll();
            /*if (!this.treeControl.isExpanded(data) && data) {

                let parent = null;

                let index = this.treeControl.dataNodes.findIndex((n) => n === data);

                for (let i = index; i >= 0; i--) {
                    if (data.level > this.treeControl.dataNodes[i].level) {
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
                this.treeControl.expand(data);
            }else{

                this.treeControl.collapse(data);
            }*/
            this._changeDetectorRef.markForCheck();
        });

        this.searchInputControl.valueChanges
            .pipe(debounceTime(5000))
            .subscribe(query => {
                this._htService.searchOrgaChart(query).subscribe((data) => {
                    this.dataSource.data = data;
                    this.treeControl.expandAll();
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });;
            });

    }

    private transformer = (node: ramaNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0 || node.haschildren,
            item: node,
            level: level
        };
    }

    loadChildren(node) {
        /*this.expandedNode = node;
        const childrenNode = this._htService.getNodeMap(node.id).childrenChange.getValue();*/

        if (this.treeControl.isExpanded(node)) {
            this.treeControl.collapse(node);
        }else{
            if ( node.haschildren && node?.children.length > 0 ) {
                this.treeControl.expand(node);
            }else{
                this._htService.getOrgaChartData(node.item.id_uo_padre, node.item);
            }
        }
    }


}
