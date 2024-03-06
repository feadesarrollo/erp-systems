import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {TreeNode} from "primeng/api";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ControlBudgetService} from "../control-budget.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDrawer} from "@angular/material/sidenav";
import {BobyMediaWatcherService} from "../../../../../../../@boby/services/media-watcher";
import { takeUntil, Observable, Subject } from 'rxjs';
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";

@Component({
  selector: 'erp-control-budget-list',
  templateUrl: './control-budget-list.component.html'
})
export class ControlBudgetListComponent implements OnInit {

    cols: any[] =  [
        { field: 'nombre_unidad', header: 'Unidad', width: '40%'},
        { field: 'categoria', header: 'Programa', width: '20%' },
        { field: 'funcionario', header: 'Funcionario', width: '20%' },
        { field: 'centro', header: 'Centro Costo', width: '20%' }
    ];

    frozenCols = [
        { field: 'nombre_unidad', header: 'Unidad', width: '40%'},
        { field: 'categoria', header: 'Programa', width: '20%' },
        { field: 'funcionario', header: 'Funcionario', width: '20%' },
        { field: 'centro', header: 'Centro Costo', width: '20%' }
    ];

    organization: TreeNode[] = [];
    centroList: any = [];
    drawerMode: 'side' | 'over';
    @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public selectedNode: any = {};
    public loading: boolean;

    constructor(
        private _formBuilder: FormBuilder,
        private _budgetService: ControlBudgetService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _bobyMediaWatcherService: BobyMediaWatcherService,
        private _loadService: BobyLoadingService
    ) { }

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

        /*this._budgetService.budgets$.subscribe((budget:any) =>{
            this.organization = [budget];
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });*/

        this._budgetService.getCentroCosto().subscribe((resp)=>{
            this.centroList = resp;
        });
    }

    loadNodes(event) {
        this.loading = true;

        this._budgetService.getControlBudget(10113,'base').subscribe((nodes:any)=>{
            this.loading = false;

            this.organization = [nodes];
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    onNodeExpand(event) {
        this.loading = true;
        this._loadService.show();
        const node = event.node;
        const id_uo = node.data.id_uo;

        this._budgetService.getControlBudget(id_uo,'expand').subscribe((nodes:any)=>{
            this.loading = false;
            this._loadService.hide();
            node.children = nodes;
            this.organization = [...this.organization];
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

    }

    refresh(){
        this.loading = true;
        this._loadService.show();
        this._budgetService.getControlBudget(10113,'base').subscribe((nodes:any)=>{
            this._loadService.hide();
            this.loading = false;

            this.organization = [nodes];
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    searchFin(query){
        this.loading = true;
        this._budgetService.searchFin(query).subscribe((nodes:any)=>{
            this.loading = false;
            this.organization = [nodes];
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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

    redirect(row){
        const node = row.node.data;
        this.selectedNode = node;
        this._router.navigate(['./', node.id_cargo_presupuesto], {relativeTo: this._activatedRoute});
    }
}
