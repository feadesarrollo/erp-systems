import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {OrganizationChartItemComponent} from "../organization-chart-item/organization-chart-item.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {MatDrawerToggleResult} from "@angular/material/sidenav";
import {OverlayRef} from "@angular/cdk/overlay";
import { Subject, takeUntil } from 'rxjs';
import {OrganizationChartService} from "../organization-chart.service";

@Component({
    selector: 'erp-organization-chart-item-details',
    templateUrl: './organization-chart-item-details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationChartItemDetailsComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _tagsPanelOverlayRef: OverlayRef;
    public editMode: boolean = false;
    public itemForm: FormGroup;
    public item: any;
    public officeList: any = [];
    public contractList: any = [];
    public scaleList: any = [];
    public itemList: any = [];
    public yearList: any = [];
    public centroList: any = [];
    public ordenList: any = [];
    private statusItem: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _itemDetailComponent: OrganizationChartItemComponent,
        private _orgaService: OrganizationChartService
    ) { }

    ngOnInit(): void {
        this._itemDetailComponent.matDrawer.open();

        this.itemForm = this._formBuilder.group({
            id_cargo: [''],
            id_tipo_contrato: ['',[Validators.required]],
            id_oficina: ['',[Validators.required]],
            id_uo: ['',[Validators.required]],
            id_temporal_cargo: ['',[Validators.required]],
            id_escala_salarial: ['',[Validators.required]],
            codigo: ['',[Validators.required]],
            fecha_ini: ['',[Validators.required]],
            fecha_fin: [''],

            id_gestion: ['',[Validators.required]],
            id_centro_costo: ['',[Validators.required]],
            id_ot: ['',[Validators.required]],
            porcentaje: ['',[Validators.required]],
            fecha_ini_cc: ['',[Validators.required]],
            fecha_fin_cc: ['',[Validators.required]],
        });

        // Get the customer
        this._orgaService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                // Open the drawer in case it is closed
                this._itemDetailComponent.matDrawer.open();
                // Get the customer
                this.item = item;
                //this.itemForm.patchValue(item);

                // Toggle the edit mode off
                this.toggleEditMode(false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._orgaService.getContractList().subscribe((resp)=>{
            this.contractList = resp;
        });

        this._orgaService.statusItem$.subscribe((status)=>{
            this.statusItem = status;

            if ( status == 'new' ) {
                this._orgaService.searchOffice('').subscribe((resp)=>{
                    this.officeList = resp;
                });
                this._orgaService.searchItem('').subscribe((resp)=>{
                    this.itemList = resp;
                });
                this._orgaService.searchScale('').subscribe((resp)=>{
                    this.scaleList = resp;
                });
                this._orgaService.searchYear('').subscribe((resp)=>{
                    this.yearList = resp;
                });
                this._orgaService.searchCentro('',{}).subscribe((resp)=>{
                    this.centroList = resp;
                });
                this._orgaService.searchOrden('').subscribe((resp)=>{
                    this.ordenList = resp;
                });
            }else{
                this.itemForm.patchValue(this.item);
            }
        });
    }


    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        this._orgaService.statusItem = '';
        return this._itemDetailComponent.matDrawer.close();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if(editMode)
            this._orgaService.statusItem = 'edit';

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

    postItem(){
        let item = this.itemForm.getRawValue();
        //const official = this.listOficials.find(ofi => ofi.id_funcionario === summative.id_funcionario);
        Object.keys(this.itemForm.getRawValue()).forEach(key => {
            if(!item[key]){
                item[key] = '';
            }
        });

        this._orgaService.postItem(item, this.statusItem)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (resp: any) => {
                    if ( !resp.error ) {
                        this.toggleEditMode(false);
                        this.officeList = [];
                        this.itemList = [];
                        this.scaleList = [];
                        this.yearList = [];
                        this.centroList = [];
                        this.ordenList = [];
                        this._itemDetailComponent.refreshItems('save');
                        this._changeDetectorRef.markForCheck();
                    }
                }
            );
    }

    deleteItem(){

    }

    /**
     * search office
     */
    searchOffice(query){
        this._orgaService.searchOffice(query).subscribe((resp)=>{
            this.officeList = resp;
        });
    }

    /**
     * get office
     */
    getOffice(id_oficina: string) {
        if ( id_oficina !== null && id_oficina !== undefined && id_oficina !== '' ) {
            if ( this.officeList.length > 0 ) {
                return this.officeList.find(oficina => oficina.id_oficina === id_oficina).nombre;
            }else{
                if ( this.item ) {
                    return this.item.nombre_oficina;
                }else{
                    return '';
                }
            }
        }

    }

    displayContract(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * search item
     */
    searchItem(query){
        this._orgaService.searchItem(query).subscribe((resp)=>{
            this.itemList = resp;
        });
    }

    /**
     * get item
     */
    getItem(id_temporal_cargo: string) {
        if ( id_temporal_cargo !== null && id_temporal_cargo !== undefined && id_temporal_cargo !== '' ) {
            if ( this.itemList.length > 0 ) {
                return this.itemList.find(cargo => cargo.id_temporal_cargo === id_temporal_cargo).nombre;
            }else{
                if ( this.item ) {
                    return this.item.nombre;
                }else{
                    return '';
                }
            }
        }
    }

    /**
     * search scale
     */
    searchScale(query){
        this._orgaService.searchScale(query).subscribe((resp)=>{
            this.scaleList = resp;
        });
    }

    /**
     * get scale
     */
    getScale(id_escala_salarial: string) {
        if ( id_escala_salarial !== null && id_escala_salarial !== undefined && id_escala_salarial !== '' ) {
            if ( this.scaleList.length > 0 ) {
                return this.scaleList.find(scale => scale.id_escala_salarial === id_escala_salarial).nombre;
            }else{
                if ( this.item ) {
                    return this.item.nombre_escala;
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
        this._orgaService.searchYear(query).subscribe((resp)=>{
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
                if ( this.item ) {
                    return this.item.gestion;
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
        this._orgaService.searchCentro(query,{}).subscribe((resp)=>{
            this.centroList = resp;
        });
    }

    /**
     * get centro
     */
    getCentro(id_centro_costo: string) {
        if ( id_centro_costo !== null && id_centro_costo !== undefined && id_centro_costo !== '' ) {
            if ( this.centroList.length > 0 ) {
                return this.centroList.find(centro => centro.id_centro_costo === id_centro_costo).gestion;
            }else{
                if ( this.item ) {
                    return this.item.codigo_cc;
                }else{
                    return '';
                }
            }
        }
    }

    /**
     * search orden
     */
    searchOrden(query){
        this._orgaService.searchOrden(query).subscribe((resp)=>{
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
                if ( this.item ) {
                    return this.item.desc_orden;
                }else{
                    return '';
                }
            }
        }
    }
}
