import {ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {TodoItemFlatNode, TodoItemNode} from "../../../human-talent.types";
import {FlatTreeControl} from "@angular/cdk/tree";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {SelectionModel} from "@angular/cdk/collections";
import {HumanTalentService} from "../../../human-talent.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageService} from "primeng/api";
import {AlcoholControlDialogComponent} from "../../alcohol-control/alcohol-control-dialog/alcohol-control-dialog.component";
import {TicketRequestService} from "../ticket-request.service";
import { MatListOption, MatSelectionList, MatSelectionListChange } from "@angular/material/list";
import {switchMap, startWith, takeUntil, debounceTime} from "rxjs/operators";
import { EMPTY, BehaviorSubject, combineLatest } from "rxjs";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import { BobyConfirmationService } from "../../../../../../../@boby/services/confirmation";
import {ItemHistoryComponent} from "./item-history/item-history.component";


@Component({
    selector: 'erp-organization-chart-ticket',
    templateUrl: './organization-chart-ticket.component.html'
})
export class OrganizationChartTicketComponent implements OnInit {

    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

    treeNodeMap = new Map<string, TodoItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: TodoItemFlatNode | null = null;

    /** The new item's name */
    newItemName = '';

    treeControl: FlatTreeControl<TodoItemFlatNode>;

    treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

    dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

    /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

    isLoading = true;

    //typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    selectedUnits: any[] = [];
    selectedOrgChart: any = [];

    markSelectedChart: TodoItemFlatNode [] = [];

    @ViewChildren(MatSelectionList) selectionList: QueryList<MatSelectionList>;
    private configForm: FormGroup;
    filters: {
        query$ : BehaviorSubject<string>;
    } = {
        query$ : new BehaviorSubject('')
    };
    public searchInputControl: FormControl = new FormControl();
    constructor(
        private _database: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _messageService: MessageService,
        private _ticketRequest: TicketRequestService,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    ) {

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        _database.initialize();

        _ticketRequest.getSelectedOrganizationChart().subscribe((resp) => {
            this.selectedUnits = resp.white_list;
            this.selectedOrgChart = resp.selected_org_chart;
            this._changeDetectorRef.markForCheck();
        });

        _database.dataChange.subscribe(data => {
            this.dataSource.data = data;
        });

        this.searchInputControl.valueChanges
            .pipe(debounceTime(5000))
            .subscribe(query => {
                this._database.searchNode(query);
            });
    }

    ngOnInit(): void {

    }

    ngAfterViewInit() {
        this.selectionList.changes
            .pipe(
                startWith(null),
                switchMap(v =>
                    this.selectionList.first
                        ? this.selectionList.first.selectedOptions.changed
                        : EMPTY
                )
            )
            .subscribe((val: any) => {

            });
    }

    getLevel = (node: TodoItemFlatNode) => node.level;

    isExpandable = (node: TodoItemFlatNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TodoItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        //const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
        if ( existingNode ) {
            return existingNode;
        }

        const newNode = new TodoItemFlatNode(node.id, level, node.hasChildren, node.item);

        //this.treeNodeMap.set(node.id, newNode);



        if ( this.selectedOrgChart.includes(+node.id) ){
            this.checklistSelection.select(newNode);
            this._changeDetectorRef.markForCheck();
        }

        this.flatNodeMap.set(newNode, node);
        this.nestedNodeMap.set(node, newNode);
        return newNode;
    };


    saveSelection(): void{

        //const selected = this.selectedUnits.reduce((accumulator, key) => {
        const selected = this.selectedOrgChart.reduce((accumulator, key) => {
            return accumulator.concat(key);
        }, []);

        this._database.postSelectedOrganization(selected).subscribe((resp)=>{

        });
    }

    deleteSelection(): void{

    }

    openDialogLottery(): void{

        const dialogRef = this._matDialog.open(AlcoholControlDialogComponent,{
            height: '60%',
            width: '80%',
            data: {
                selectedUnits: this.selectedUnits
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ERROR',
                        detail: result.message,
                        life: 9000
                    });
                }else{
                    this._messageService.add({
                        severity: 'success',
                        summary: 'EXITO',
                        detail: `${result.detail.message}, Sorteo Generado.`,
                        life: 9000
                    });
                }
            });
    }



    loadChildren(node): void{

        const childrenNode = this._database.getTreeNodeMap(node.id).childrenChange.getValue();

        if (this.treeControl.isExpanded(node)) {
            if ( childrenNode.length === 0 ) {

                this._database.loadMore(node);
            }
        }
    }

    refreshOrgChart(){
        this._ticketRequest.getSelectedOrganizationChart().subscribe((resp) => {
            this.selectedUnits = resp.white_list;
            this.selectedOrgChart = resp.selected_org_chart;
            this._changeDetectorRef.markForCheck();
        });
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TodoItemFlatNode): boolean {

        //this.selectedUnits = this.checklistSelection.selected;
        const descendants = this.treeControl.getDescendants(node);

        if ( !this.selectedOrgChart.includes(+node.id) ){
            if ( this.checklistSelection.isSelected(node) ) {
                //this.selectedOrgChart = [...this.selectedOrgChart, +node.id]
                this.selectedOrgChart = this.checklistSelection.selected.reduce((accumulator, key) => {
                    return accumulator.concat(+key.id);
                }, []);
            }
        }
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every(child => {
                return this.checklistSelection.isSelected(child);
            });

        return descAllSelected || this.checklistSelection.selected.includes(node);
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: TodoItemFlatNode, event): void {
        this._ticketRequest.checkedSelection(node.id,node.expandable,event).subscribe(
            (resp)=>{
                if ( resp.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: resp.message,
                        life: 9000
                    });
                }else{
                    this.selectedUnits = JSON.parse(resp.data.white_list);
                    this.selectedOrgChart = JSON.parse(resp.data.selected_org_chart);
                    this._changeDetectorRef.markForCheck();
                }
            }
        );

        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        //descendants.forEach(child => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: TodoItemFlatNode, event): void {
        this._ticketRequest.checkedSelection(node.id,node.expandable,event).subscribe(
            (resp)=>{
                if ( resp.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: resp.message,
                        life: 9000
                    });
                }else{
                    this.selectedUnits = JSON.parse(resp.data.white_list);
                    this.selectedOrgChart = JSON.parse(resp.data.selected_org_chart);
                    this._changeDetectorRef.markForCheck();
                }
            }
        );

        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every(child => {
                return this.checklistSelection.isSelected(child);
            });
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    /** Select the category so we can insert the new item. */
    addNewItem(node: TodoItemFlatNode) {
        const parentNode = this.flatNodeMap.get(node);
        this._database.insertItem(parentNode!, '');
        this.treeControl.expand(node);
    }

    /** Save the node to database */
    saveNode(node: TodoItemFlatNode, itemValue: string) {
        const nestedNode = this.flatNodeMap.get(node);
        this._database.updateItem(nestedNode!, itemValue);
    }

    selectionChange(option: MatSelectionListChange){
    }

    selectionClick(item){

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    itenDeselected(item){
        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `Estimado Usuario, esta seguro de eliminar el cargo parametrizado?`,
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Confirmar',
                    color: 'warn'
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancelar'
                })
            }),
            dismissible: true
        });

        const dialogRef = this._fcService.open(this.configForm.value);

        // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                this._ticketRequest.checkedSelection(item.id_uo,item.haschildren,false).subscribe(
                    (resp)=>{
                        if ( resp.error ){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        }else{
                            this.selectedUnits = JSON.parse(resp.data.white_list);
                            this.selectedOrgChart = JSON.parse(resp.data.selected_org_chart);
                            this._changeDetectorRef.markForCheck();
                        }
                    }
                );
            }
        });
    }

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this.filters.query$.next(query);
    }

    seeHistory(){
        const dialogRef = this._matDialog.open(ItemHistoryComponent, {
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
    }
}
