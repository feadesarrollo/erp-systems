import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { TreeNode } from "primeng/api";
import { FormControl } from "@angular/forms";
import { FoodNode } from "../../../../claims-management/settings/settings.type";
import { LeafNode, LoadMoreNode } from "../../../human-talent.types";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { HumanTalentService } from "../../../human-talent.service";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import {MatDrawer} from "@angular/material/sidenav";
import {BobyMediaWatcherService} from "../../../../../../../@boby/services/media-watcher";
import {ActivatedRoute, Router} from "@angular/router";

import { takeUntil, Subject, switchMap, map, Observable, merge } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import {MatDialog} from "@angular/material/dialog";
import {OrganizationChartDialogComponent} from "../organization-chart-dialog/organization-chart-dialog.component";

@Component({
  selector: 'erp-organization-chart-list',
  templateUrl: './organization-chart-list.component.html'
})
export class OrganizationChartListComponent implements OnInit {

    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
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
    nodeMap = new Map<string, LeafNode>();
    treeControl: FlatTreeControl<LeafNode>;
    treeFlattener: MatTreeFlattener<LoadMoreNode, LeafNode>;
    // Flat tree data source
    dataSource: MatTreeFlatDataSource<LoadMoreNode, LeafNode>;

    expandedNode: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    drawerMode: 'side' | 'over';
    selectedOrganization: any = {};
    constructor(
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _bobyMediaWatcherService: BobyMediaWatcherService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _matDialog: MatDialog
    ) {
        this.treeControl = new FlatTreeControl<LeafNode>(this.getLevel, this.isExpandable);

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this._htService.getOrganizationData('0',{},'query');

        this._htService._orgaStructure.subscribe((data) => {
            this.dataSource.data = data;

            if ( !this.searchInputControl.value ) {

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

                    //this.treeControl.collapse(this.expandedNode);
                    this.treeControl.collapseAll();
                }
            }else{
                if ( this.searchInputControl.value && this.searchInputControl.value != '' ) {
                    this.treeControl.expandAll();
                }else{
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

    ngOnInit(): void {
        // Subscribe to media changes
        this._bobyMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.loading = true;
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(debounceTime(2000))
            .subscribe(query => {
                if (!this.searchInputControl.value){
                    this._htService.getOrganizationData('0',{},'search');
                }else {
                    this._htService.searchOrganizationChart(query).subscribe();
                }
            });
    }

    /**
     * Create Orga
     */
    createOrga(): void{
        // Create the item
        this._htService.createOrga().subscribe((newOrga) => {
            console.warn('newOrga',newOrga);
            this._htService.statusOrga = 'new';
            this.selectedNode = newOrga;
            // Go to the new item
            this._router.navigate(['./', newOrga.id_uo], {relativeTo: this._activatedRoute});
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    refreshOrga(momento){

        this._htService.getOrganizationData('0',{},'search');
    }

    redirect(row){
        this._htService.selectedNode = row.item;
        this.selectedNode = row;
        this._router.navigate(['./', row.id], {relativeTo: this._activatedRoute});
    }

    selected(row){
        this._htService.selectedNode = row.item;
        this.selectedNode = row;
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void
    {
        // Go back to the list
        this._router.navigate(['./'], {relativeTo: this._activatedRoute});

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
        const childrenNode = this._htService.getNodeMap(node.id).childrenChange.getValue();

        if (this.treeControl.isExpanded(node)) {
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
            case 'item':
                //this._router.navigate(['/details'], {relativeTo: this._activatedRoute});
                //this._router.navigate([`/system/human-talent/modules/settings/organization/${this._activatedRoute.snapshot.paramMap.get('id')}/details`], {relativeTo: this._activatedRoute});
                this._router.navigate([`/system/human-talent/modules/settings/organization/${this.selectedNode.id}/details`], {relativeTo: this._activatedRoute});
                this._changeDetectorRef.markForCheck();
                /*const dialogRef = this._matDialog.open(OrganizationChartDialogComponent, {
                    height: '90%',
                    width: '90%',
                    data: {
                        node: this.selectedNode.item
                    }
                });

                dialogRef.afterClosed()
                    .subscribe((result) => {

                    });*/
                break;
            case 'eliminar':
                break;
            case 'exportar':
                break;
        }
    }

    onNodeExpand(event) {
        this.loading = true;
    }

    onDrop(event) {
        let drag = event.dragNode.data;
        let drop = event.dropNode.data;

        this._htService.putOrganizationData(drag, drop).subscribe((resp)=>{

        });
    }
}
