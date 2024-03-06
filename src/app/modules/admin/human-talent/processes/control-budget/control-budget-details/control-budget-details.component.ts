import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ControlBudgetListComponent} from "../control-budget-list/control-budget-list.component";
import {MatDrawerToggleResult} from "@angular/material/sidenav";
import { Subject, takeUntil } from 'rxjs';
import {ControlBudgetService} from "../control-budget.service";
import * as moment from "moment";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
@Component({
  selector: 'erp-control-budget-details',
  templateUrl: './control-budget-details.component.html'
})
export class ControlBudgetDetailsComponent implements OnInit {

    public editMode: boolean = false;
    public budgetForm: FormGroup;

    public yearList: any = [];
    public centroList: any = [];
    public ordenList: any = [];
    public budget: any;
    public modo: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _list: ControlBudgetListComponent,
        private _budgetService: ControlBudgetService,
        private _loadService: BobyLoadingService
    ) { }

    ngOnInit(): void {

        this._list.matDrawer.open();

        this.budgetForm = this._formBuilder.group({
            id_cargo_presupuesto: '',
            id_cargo: '',
            id_centro_costo: ['',[Validators.required]],
            id_ot: ['',[Validators.required]],
            id_gestion: ['',[Validators.required]],
            porcentaje: ['',[Validators.required]],
            fecha_ini: ['',[Validators.required]],
            fecha_fin: ['',[Validators.required]],
            modo: ['funcionario',[Validators.required]]
        });

        // Get the customer
        this._budgetService.budget$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((budget: any) => {
                // Open the drawer in case it is closed
                this._list.matDrawer.open();
                // Get the budget
                this.budget = budget;

                const startArray = budget.fecha_ini.split('-');
                const endArray = budget.fecha_fin.split('-');
                this.budgetForm.patchValue(budget);
                this.budgetForm.get('fecha_ini').setValue(new Date(startArray[0],startArray[1]-1,startArray[2]));
                this.budgetForm.get('fecha_fin').setValue(new Date(endArray[0],endArray[1]-1,endArray[2]));
                // Toggle the edit mode off
                this.toggleEditMode(false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._list.matDrawer.close();
    }

    postBudget(){
        let budget = this.budgetForm.getRawValue();
        Object.keys(this.budgetForm.getRawValue()).forEach(key => {
            if(!budget[key]){
                budget[key] = '';
            }

            if(key == 'fecha_ini' || key == 'fecha_fin'){
                budget[key] = moment.utc(budget[key]).format('DD/MM/YYYY');
            }
        });

        const centro = this.centroList.find(bud => bud.id_centro_costo == this.budgetForm.get('id_centro_costo').value);
        this.budget.id_centro_costo = centro.id_centro_costo;
        this.budget.desc_centro_costo = centro.codigo_cc;

        this._loadService.show();
        this._budgetService.postBudget(budget)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (resp: any) => {
                    this._loadService.hide();
                    if (resp) {
                        if (!resp.error) {
                            this.toggleEditMode(false);

                            this._changeDetectorRef.markForCheck();
                        }
                    }
                }
            );
    }

    deleteBudget(){

    }

    /**
     * Change value incident type
     */
    onTypeChange(ev){
        this.modo = ev.value;
    }
    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * search orden
     */
    searchOrden(query){
        this._budgetService.searchOrden(query).subscribe((resp)=>{
            this.ordenList = resp;
        });
    }

    /**
     * get orden
     */
    getOrden(id_ot: string) {
        if ( id_ot !== null && id_ot !== undefined && id_ot !== '' ) {
            if ( this.ordenList.length > 0 ) {
                return this.ordenList.find(orden => orden.id_orden_trabajo === id_ot).desc_orden;
            }else{
                if ( this.budget ) {
                    return this.budget.desc_orden;
                }else{
                    return '';
                }
            }
        }
    }

    /**
     * search centro
     */
    searchCentro(query){
        this._budgetService.searchCentro(query,{
            id_gestion : this.budget.id_gestion
        }).subscribe((resp)=>{
            this.centroList = resp;
        });
    }

    /**
     * get centro
     */
    getCentro(id_centro_costo: string) {
        if ( id_centro_costo !== null && id_centro_costo !== undefined && id_centro_costo !== '' ) {
            if ( this.centroList.length > 0 ) {
                return this.centroList.find(centro => centro.id_centro_costo === id_centro_costo).codigo_cc;
            }else{
                if ( this.budget ) {
                    return this.budget.desc_centro_costo;
                }else{
                    return '';
                }
            }
        }
    }

    /**
     * search year
     */
    searchYear(query){
        this._budgetService.searchYear(query).subscribe((resp)=>{
            this.yearList = resp;
        });
    }

    /**
     * get year
     */
    getYear(id_gestion: string) {
        if ( id_gestion !== null && id_gestion !== undefined && id_gestion !== '' ) {
            if ( this.yearList.length > 0 ) {
                return this.yearList.find(year => year.id_gestion === id_gestion).gestion;
            }else{
                if ( this.budget ) {
                    return this.budget.fecha_ini.split('-')[0];
                }else{
                    return '';
                }
            }
        }
    }

}
