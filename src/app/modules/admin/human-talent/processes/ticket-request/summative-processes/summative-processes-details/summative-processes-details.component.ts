import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SummativeProcessesListComponent} from "../summative-processes-list/summative-processes-list.component";
import {ActivatedRoute, Router} from "@angular/router";
import {SummativeProcessesService} from "../summative-processes.service";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {MatDrawerToggleResult} from "@angular/material/sidenav";
import {ClaimsService} from "../../../../../claims-management/claims/claims.service";
import * as moment from "moment";
import {BobyConfirmationService} from "../../../../../../../../@boby/services/confirmation";

@Component({
    selector: 'erp-summative-processes-details',
    templateUrl: './summative-processes-details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummativeProcessesDetailsComponent implements OnInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public editMode: boolean = false;
    public summativeForm: FormGroup;
    public summative: any;
    public summatives: any;
    public listOficials: any = [];
    private statusSummative:string = '';
    constructor(
        private _summativeListComponent: SummativeProcessesListComponent,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _summativeService: SummativeProcessesService,
        private _claimService: ClaimsService,
        private _bobyConfirmationService: BobyConfirmationService,
        private _router: Router
    ) { }

    ngOnInit(): void {

        // Open the drawer
        this._summativeListComponent.matDrawer.open();
        this.summativeForm = this._formBuilder.group({
            id_summative_process: [''],
            id_funcionario: ['',[Validators.required]],
            start_date: ['',[Validators.required]],
            end_date: ['',[Validators.required]],
            summative_reason: ['']
        });

        this._summativeService.statusSummative$.subscribe(value=>{
            this.statusSummative = value;
        });

        this._summativeService.$emitter.subscribe(() => {
            this.deleteSummativeProcess();
        });

        // Get the customer
        this._summativeService.summative$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summative: any) => {
                // Open the drawer in case it is closed
                this._summativeListComponent.matDrawer.open();
                // Get the customer
                this.summative = summative;
                this._summativeListComponent.selected(summative);

                const startArray = summative.start_date.split('-');
                const endArray = summative.end_date.split('-');
                this.summativeForm.patchValue(summative);
                this.summativeForm.get('start_date').setValue(new Date(startArray[0],startArray[1]-1,startArray[2]));
                this.summativeForm.get('end_date').setValue(new Date(endArray[0],endArray[1]-1,endArray[2]));

                // Toggle the edit mode off
                this.toggleEditMode(false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the roles
        this._summativeService.summatives$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((summatives: any) => {
                this.summatives = summatives;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._summativeListComponent.matDrawer.close();
    }

    uploadAvatar(file){}

    removeAvatar(){}

    deleteSummativeProcess(){
        // Open the confirmation dialog
        const confirmation = this._bobyConfirmationService.open({
            title  : 'Eliminar proceso sumario',
            message: 'Está seguro de que desea eliminar este proceso? Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Eliminar'
                },
                cancel: {
                    label: 'Cancelar'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the current role's id
                const id_summative_process = +this.summative.id_summative_process;

                // Get the next/previous summtive's id
                const currentSummativeIndex = this.summatives.findIndex(item => +item.id_summative_process === id_summative_process);
                const nextSummativeIndex = currentSummativeIndex + ((currentSummativeIndex === (this.summatives.length - 1)) ? -1 : 1);
                const nextSummativeId = (this.summatives.length === 1 && +this.summatives[0].id_summative_process === id_summative_process) ? null : +this.summatives[nextSummativeIndex].id_summative_process;

                // Delete the role
                this._summativeService.deleteSummativeProcess(id_summative_process)
                    .subscribe((isDeleted) => {

                        // Return if the role wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }
                        this._summativeListComponent.refreshSummative();
                        // Navigate to the next role if available
                        if ( nextSummativeId )
                        {
                            this._router.navigate(['../', nextSummativeId], {relativeTo: this._activatedRoute});
                        }
                        // Otherwise, navigate to the parent
                        else
                        {
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    postSummative(){

        let summative = this.summativeForm.getRawValue();
        //const official = this.listOficials.find(ofi => ofi.id_funcionario === summative.id_funcionario);
        Object.keys(this.summativeForm.getRawValue()).forEach(key => {
            if(!summative[key]){
                summative[key] = '';
            }
            /*if(key == 'start_date' || key == 'end_date'){
                summative[key] = moment.utc(summative[key]).format('DD/MM/YYYY');
            }*/
        });
        //this._summativeService.statusSummative = 'edit';
        this._summativeService.postSummative(summative, this.statusSummative)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (resp: any) => {
                    if ( !resp.error ) {
                        this.toggleEditMode(false);
                        this.listOficials = [];
                        this._summativeListComponent.refreshSummative();
                        //this._customerListComponent.redirect(this.customer);
                        this._changeDetectorRef.markForCheck();
                    }
                }
            );
    }

    /**
     * load Funcionario
     */
    searchOfficial(query: string, status: string): void
    {
        this._claimService.searchFuncionario(query).subscribe(
            (lists) => {
                this.listOficials = lists;
                if (status == 'open'){
                    this.summativeForm.get('id_summative_process').setValue(this.listOficials[0].id_summative_process)
                }
            }
        );
    }

    /**
     * Get name official
     */
    getOfficial(id_funcionario: string) {
        if ( id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '' ) {
            if ( this.listOficials.length > 0 ) {
                const name = this.listOficials.find(summative => {
                    if (+summative.id_funcionario == +id_funcionario) {
                        return summative;
                    }
                }).desc_funcionario2;
                return name;
            }else{
                if ( this.summative ) {
                    return this.summative.nombre_funcionario;
                }else{
                    return '';
                }
            }
        }
    }

}
