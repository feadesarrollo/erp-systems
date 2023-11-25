import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from "@angular/material/sidenav";
import {FormArray, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BobyMediaWatcherService} from "../../../../../../@boby/services/media-watcher";
import {MatDialog} from "@angular/material/dialog";
import {MessageService} from "primeng/api";
import {AdministratorService} from "../administrator.service";
import {BobyConfirmationService} from "../../../../../../@boby/services/confirmation";
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {GroupEmailsDialogComponent} from "./group-emails-dialog/group-emails-dialog.component";
import {GroupEmailsService} from "./group-emails.service";
import {ClaimsService} from "../../claims/claims.service";

@Component({
  selector: 'erp-group-emails',
  templateUrl: './group-emails.component.html'
})
export class GroupEmailsComponent implements OnInit {

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
    public officialsList: any [] = [];
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: BobyMediaWatcherService,
        private _matDialog: MatDialog,
        private _msgService: MessageService,
        private _geService: GroupEmailsService,
        private _formBuilder: FormBuilder,
        private _bobyConfirmationService: BobyConfirmationService,
        private _claimService: ClaimsService
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
                email: ['']
            })
        });

        this._geService.getGroupEmails().subscribe(
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
                this.updateEmail();
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
        this.selectedPanel = panel?.id_classifiers;

        this._geService.emails = panel?.json_fields;
        this.selectedFields = panel?.json_fields;

        (this.valuesForm.get('values') as FormArray).clear();
        const parameters = [];
        // Iterate through them
        this.selectedFields?.forEach((field) => {
            // Create an user form group
            parameters.push(
                this._formBuilder.group({
                    id: [field.id],
                    slug: [field.slug],
                    email: [field.email],
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
     * Show dialog group emails
     */
    showGroupEmailsDialog(id_classifiers: number){
        let dialogRef;
        if ( id_classifiers == 0 ) {
            dialogRef = this._matDialog.open(GroupEmailsDialogComponent, {
                data: {status: 'new'},
                disableClose: true
            });
        }else{
            const group = this.panels.find(item => item.id_classifiers === id_classifiers);
            dialogRef = this._matDialog.open(GroupEmailsDialogComponent, {
                data: {status: 'edit', group},
                disableClose: true
            });
        }

        dialogRef.afterClosed()
            .subscribe((result) => {
                if ( result.error ) {
                    this._msgService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail:  result.message,
                        life: 9000
                    });
                }else{
                    this._msgService.add({
                        severity: 'success',
                        summary: 'EXITO',
                        detail: `Grupo  Guardado.`,
                        life: 9000
                    });
                    this.refreshGroupEmails();
                }
            });

    }

    refreshGroupEmails(){
        this._geService.getGroupEmails().subscribe(
            (resp) => {
                this.panels = resp;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /**
     * Edit a group emails
     */
    editGroupEmails(id: string): void
    {

    }

    /**
     * Delete a group emails
     */
    deleteGroupEmails(id_classifiers){

        // Open the confirmation dialog
        const confirmation = this._bobyConfirmationService.open({
            title  : 'ELIMINAR',
            message: 'Está seguro de que desea eliminar el agrupador de correos? Esta acción no se puede deshacerse!',
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
                this.goToPanel({id_classifiers:0});
                // Delete parameter on the server
                this._geService.deleteGroupEmails(id_classifiers).subscribe( (resp) => {
                    this.refreshGroupEmails();
                });
            }
        });


    }

    /**
     * Add email
     */
    addEmail(): void
    {
        // Add value to the server
        this._geService.addEmail( this.valuesForm.get('newValue').value, this.selectedPanel ).subscribe((addedValue) => {

            if ( addedValue.error ) {
                this._msgService.add({
                    severity: 'error',
                    summary: 'ADVERTENCIA',
                    detail:  addedValue.message,
                    life: 9000
                });
            }else {

                this._geService.emails$.subscribe((value)=>{
                    this.selectedFields = value;
                });

                (this.valuesForm.get('values') as FormArray).clear();
                const groups = [];
                // Iterate through them
                this.selectedFields.forEach((field) => {
                    // Create an value form group
                    groups.push(
                        this._formBuilder.group({
                            id: [field.id],
                            slug: [field.slug],
                            email: [field.email],
                        })
                    );
                });

                // Add the user form groups to the users form array
                groups.forEach((paramFormGroup) => {
                    (this.valuesForm.get('values') as FormArray).push(paramFormGroup);
                });
                this._changeDetectorRef.markForCheck();
                // Reset the new value form
                this.valuesForm.get('newValue').markAsPristine();
                this.valuesForm.get('newValue').markAsUntouched();
                this.valuesForm.get('newValue.email').reset();
                this.valuesForm.get('newValue.email').clearValidators();
                this.valuesForm.get('newValue.email').updateValueAndValidity();
                this.officialsList = [];
                this.refreshGroupEmails();
            }
        });
    }

    /**
     * Update email
     */
    updateEmail(): void
    {
        // Iterate through the values form array controls
        (this.valuesForm.get('values') as FormArray).controls.forEach((valueFormGroup) => {
            // If the label has been edited...
            if ( valueFormGroup.dirty )
            {
                // Update the value on the server
                this._geService.updateEmail(this.selectedPanel, valueFormGroup.value.id, valueFormGroup.value).subscribe();
            }
        });

        // Reset the values form array
        this.valuesForm.get('values').markAsPristine();
        this.valuesForm.get('values').markAsUntouched();
    }

    /**
     * Delete a email
     */
    deleteEmail(id: string): void
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
                this._geService.deleteEmail(this.selectedPanel, id).subscribe( (resp) => {

                });
            }
        });
    }

    /**
     * GET List Officials
     */
    searchOfficials(query: string): void
    {
        this._claimService.searchFuncionario(query).subscribe(
            (officialList) => {
                this.officialsList = officialList;
            }
        );
    }

    /**
     * GET Name Offical
     */
    officialListName(email_empresa: string) {
        if ( this.officialsList?.length > 0 ) {
            return this.officialsList?.find(official => official.email_empresa === email_empresa).email_empresa;
        }else{
            return '';
        }
    }

}
