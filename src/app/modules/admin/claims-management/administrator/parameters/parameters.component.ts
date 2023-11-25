import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, take } from 'rxjs/operators';
import { BobyMediaWatcherService } from '@boby/services/media-watcher';
import { FormControl } from "@angular/forms";
import { ParametersDialogComponent } from './parameters-dialog/parameters-dialog.component';
import { MatDialog } from "@angular/material/dialog";
import { MessageService } from "primeng/api";
import { AdministratorService } from "../administrator.service";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BobyConfirmationService } from "@boby/services/confirmation";


@Component({
  selector: 'erp-parameters',
  templateUrl: './parameters.component.html'
})
export class ParametersComponent implements OnInit {

    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any [] = [];
    public selectedPanel: string = '0';
    private selectedFields: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public searchInputControl: FormControl = new FormControl();
    public parametersCount: number = 0;

    /************************** DETAILS **************************/

    /************************** DETAILS **************************/
    valuesForm: FormGroup;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: BobyMediaWatcherService,
        private _matDialog: MatDialog,
        private _msgService: MessageService,
        private _settingS: AdministratorService,
        private _formBuilder: FormBuilder,
        private _bobyConfirmationService: BobyConfirmationService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.valuesForm = this._formBuilder.group({
            values  : this._formBuilder.array([]),
            newValue: this._formBuilder.group({
                title: [''/*, Validators.required*/]
            })
        });

        this._settingS.getParameters().subscribe(
            (resp: any) => {
                this.panels = resp;
                this.parametersCount = this.panels.length;
                this._changeDetectorRef.markForCheck();
            }
        );

        this.parametersCount = this.panels.length;

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Update labels when there is a value change
        this.valuesForm.get('values').valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.updateValue();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: any): void
    {
        this.selectedPanel = panel?.id_settings;

        this._settingS.values = panel?.fields;
        this.selectedFields = panel?.fields;

        (this.valuesForm.get('values') as FormArray).clear();
        const parameters = [];
        // Iterate through them
        this.selectedFields?.forEach((field) => {
            // Create an user form group
            parameters.push(
                this._formBuilder.group({
                    id: [field.id],
                    slug: [field.slug],
                    title: [field.title],
                })
            );
        });

        // Add the user form groups to the users form array
        parameters.forEach((paramFormGroup) => {
            (this.valuesForm.get('values') as FormArray).push(paramFormGroup);
        });

        this._changeDetectorRef.markForCheck();
        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
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


    /**
     * Show dialog compensation form
     */
    showParametersDialog(id_settings: number){


        let dialogRef;
        if ( id_settings == 0 ) {
            dialogRef = this._matDialog.open(ParametersDialogComponent, {
                data: {status: 'new'},
                disableClose: true
            });
        }else{
            const group = this.panels.find(item => item.id_settings === id_settings);
            dialogRef = this._matDialog.open(ParametersDialogComponent, {
                data: {status: 'edit', group},
                disableClose: true
            });
        }

        /*const dialogRef = this._matDialog.open(ParametersDialogComponent,{
            height: '70%',
            width: '35%',
            data: {status: 'new'}
        });*/

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result != undefined ) {
                    if (result.error) {
                        this._msgService.add({
                            severity: 'error',
                            summary: 'ADVERTENCIA',
                            detail: result.message,
                            life: 9000
                        });
                    } else {
                        this._msgService.add({
                            severity: 'success',
                            summary: 'EXITO',
                            detail: `Clasificador  Guardado.`,
                            life: 9000
                        });
                        this.refreshParameters();
                    }
                }
            });

    }

    refreshParameters(){
        this._settingS.getParameters().subscribe(
            (resp) => {
                this.panels = resp;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    deleteParameter(id_settings){

        // Open the confirmation dialog
        const confirmation = this._bobyConfirmationService.open({
            title  : 'ELIMINAR',
            message: 'Está seguro de que desea eliminar el clasificador? Esta acción no se puede deshacerse!',
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
                this.goToPanel({id_settings:0});
                // Delete parameter on the server
                this._settingS.deleteParameter(id_settings).subscribe( (resp) => {
                    this.refreshParameters();
                });
            }
        });


    }

    /**
     * Add a label
     */
    addValue(): void
    {
        // Add value to the server
        this._settingS.addValue( this.valuesForm.get('newValue').value, this.selectedPanel ).subscribe((addedValue) => {

            if ( addedValue.error ) {
                this._msgService.add({
                    severity: 'error',
                    summary: 'ADVERTENCIA',
                    detail:  addedValue.message,
                    life: 9000
                });
            }else {

                this._settingS.values$.subscribe((value)=>{
                    this.selectedFields = value;
                });

                (this.valuesForm.get('values') as FormArray).clear();
                const parameters = [];
                // Iterate through them
                this.selectedFields.forEach((field) => {
                    // Create an value form group
                    parameters.push(
                        this._formBuilder.group({
                            id: [field.id],
                            slug: [field.slug],
                            title: [field.title],
                        })
                    );
                });

                // Add the user form groups to the users form array
                parameters.forEach((paramFormGroup) => {
                    (this.valuesForm.get('values') as FormArray).push(paramFormGroup);
                });
                this._changeDetectorRef.markForCheck();
                // Reset the new value form
                this.valuesForm.get('newValue').markAsPristine();
                this.valuesForm.get('newValue').markAsUntouched();
                this.valuesForm.get('newValue.title').reset();
                this.valuesForm.get('newValue.title').clearValidators();
                this.valuesForm.get('newValue.title').updateValueAndValidity();
                this.refreshParameters();
            }
        });
    }

    /**
     * Update value
     */
    updateValue(): void
    {
        // Iterate through the values form array controls
        (this.valuesForm.get('values') as FormArray).controls.forEach((valueFormGroup) => {
            // If the label has been edited...
            if ( valueFormGroup.dirty )
            {
                // Update the value on the server
                this._settingS.updateValue(this.selectedPanel, valueFormGroup.value.id, valueFormGroup.value).subscribe();
            }
        });

        // Reset the values form array
        this.valuesForm.get('values').markAsPristine();
        this.valuesForm.get('values').markAsUntouched();
    }

    /**
     * Delete a value
     */
    deleteValue(id: string): void
    {
        // Open the confirmation dialog
        const confirmation = this._bobyConfirmationService.open({
            title  : 'ELIMINAR',
            message: 'Está seguro de que desea eliminar este valor? Esta acción no se puede deshacerse!',
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
                // Get the values form array
                const valuesFormArray = this.valuesForm.get('values') as FormArray;

                // Remove the value from the values form array
                valuesFormArray.removeAt(valuesFormArray.value.findIndex(label => label.id === id));

                // Delete value on the server
                this._settingS.deleteValue(this.selectedPanel, id).subscribe( (resp) => {
                });
            }
        });
    }

}
