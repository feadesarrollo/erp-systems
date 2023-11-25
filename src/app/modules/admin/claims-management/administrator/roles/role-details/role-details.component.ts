import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { RoleListComponent } from '../role-list/role-list.component'
import { AdministratorService } from '../../administrator.service';
import { BobyConfirmationService } from '@boby/services/confirmation';
import { Observable, startWith, map } from "rxjs";
import { ClaimsService } from "../../../claims/claims.service";

@Component({
    selector: 'erp-role-details',
    templateUrl: './role-details.component.html',
    styleUrls: ['./role-details.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleDetailsComponent implements OnInit {

    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tags: any[];
    tagsEditMode: boolean = false;
    filteredTags: any[];
    role: any;
    roleForm: FormGroup;
    roles: any[];
    countries: any[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public selectedFunc: any[] =[];
    public filteredFunc: Observable<any[]>;
    public officialList: any[] =[];
    public lastFilter: string = '';

    public claimStatusList: any[] =[];
    public answerStatusList: any[] =[];
    public rolesList: any[] =[];
    public permissionsList: any[] =[];


    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _rolesListComponent: RoleListComponent,
        private _rolesService: AdministratorService,
        private _formBuilder: FormBuilder,
        private _bobyConfirmationService: BobyConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _reclamoService: ClaimsService
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
        this.permissionsList = [
            {id:'create', name:'Crear'},
            {id:'read', name:'Lectura'},
            {id:'update', name:'Actualizar'},
            {id:'delete', name:'Eliminar'}
        ];
        // Open the drawer
        this._rolesListComponent.matDrawer.open();

        // Create the role form
        this.roleForm = this._formBuilder.group({
            id          : [''],
            id_rol      : [''],
            name        : ['', [Validators.required]],
            notes       : [null, [Validators.required]],
            states      : [[], [Validators.required]],
            roles       : [[]],
            officials   : [[], [Validators.required]],
            permitsClaim : this._formBuilder.array([]),
            permitsAnswer : this._formBuilder.array([]),
            permitsReport : this._formBuilder.array([])
        });


        this.filteredFunc = this.roleForm.get('officials').valueChanges.pipe(
            startWith<string | any[]>(''),
            map(value => typeof value === 'string' ? value : this.lastFilter),
            map(filter => this.filter(filter))
        );


        /*this._rolesService.getRolesList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rolesList: any) => {
                this.rolesList = JSON.parse(rolesList.datos[0].roles_list);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });*/

        // Get the roles
        this._rolesService.roles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles: any) => {
                this.roles = roles;
                this.rolesList = roles;
                //this.roleForm.patchValue(this.roles);
                //this.selectedFunc = roles.officials;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the role
        this._rolesService.role$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((role: any) => {
                // Open the drawer in case it is closed
                this._rolesListComponent.matDrawer.open();

                // Get the role
                this.role = role;

                (this.roleForm.get('permitsClaim') as FormArray).clear();
                (this.roleForm.get('permitsAnswer') as FormArray).clear();
                (this.roleForm.get('permitsReport') as FormArray).clear();
                // Patch values to the form
                this.roleForm.patchValue(role);

                if ( role.officials.length ){
                    this.selectedFunc = role.officials;
                }else if ( !role.officials.length && !role.states.length && !role.roles.length ){
                    this.selectedFunc = [];
                    this.roleForm.get('id_rol').setValue('');
                }

                /************************************ load permits claim ************************************/
                // Setup the permitsClaim form array
                const permissionClaimFormGroups = [];
                if ( this.role.permitsClaim?.length > 0 )
                {
                    // Iterate through them
                    this.role.permitsClaim.forEach((perm) => {

                        // Create an user form group
                        permissionClaimFormGroups.push(
                            this._formBuilder.group({
                                permission: [perm.permission],
                                states: [perm.states]
                            })
                        );
                    });
                }
                else
                {
                    // Create an permission claim form group
                    permissionClaimFormGroups.push(
                        this._formBuilder.group({
                            permission: [[]],
                            states: [[]]
                        })
                    );
                }

                // Add the user form groups to the users form array
                permissionClaimFormGroups.forEach((permFormGroup) => {
                    (this.roleForm.get('permitsClaim') as FormArray).push(permFormGroup);
                });
                /************************************ load permits claim ************************************/
                /************************************ load permits answer ************************************/
                    // Setup the permits answer form array
                const permissionAnswerFormGroups = [];

                if ( this.role.permitsAnswer?.length > 0 )
                {
                    // Iterate through them
                    this.role.permitsAnswer.forEach((perm) => {

                        // Create an user form group
                        permissionAnswerFormGroups.push(
                            this._formBuilder.group({
                                permission: [perm.permission],
                                states: [perm.states]
                            })
                        );
                    });
                }
                else
                {
                    // Create an permits answer form group
                    permissionAnswerFormGroups.push(
                        this._formBuilder.group({
                            permission: [[]],
                            states: [[]]
                        })
                    );
                }

                // Add the permits answer form groups to the users form array
                permissionAnswerFormGroups.forEach((permFormGroup) => {
                    (this.roleForm.get('permitsAnswer') as FormArray).push(permFormGroup);
                });
                /************************************ load permits answer ************************************/
                /************************************ load permits report ************************************/
                // Setup the permits report form array
                const permissionReportFormGroups = [];
                if ( this.role.permitsReport?.length > 0 )
                {
                    // Iterate through them
                    this.role.permitsReport.forEach((perm) => {

                        // Create an permits report form group
                        permissionReportFormGroups.push(
                            this._formBuilder.group({
                                permission: [perm.permission],
                                states: [perm.states]
                            })
                        );
                    });
                }
                else
                {
                    // Create an permits report form group
                    permissionReportFormGroups.push(
                        this._formBuilder.group({
                            permission: [[]],
                            states: [[]]
                        })
                    );
                }

                // Add the permits report form groups to the users form array
                permissionReportFormGroups.forEach((permFormGroup) => {
                    (this.roleForm.get('permitsReport') as FormArray).push(permFormGroup);
                });
                /************************************ load permits report ************************************/

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        this._rolesService.getStatusList('REC')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((statusList: any) => {
                this.claimStatusList = JSON.parse(statusList.datos[0].status_list);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._rolesService.getStatusList('RESP')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((statusList: any) => {
                this.answerStatusList = JSON.parse(statusList.datos[0].status_list);
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the country telephone codes
        this._rolesService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: any[]) => {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tags
        this._rolesService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: any[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    displaystatus(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    filter(filter: string): any[] {
        this.lastFilter = filter;
        if (filter) {
            return this.officialList.filter(option => {
                return option.desc_funcionario2.toLowerCase().indexOf(filter.toLowerCase()) >= 0
                    || option.desc_funcionario1.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
            })
        } else {
            return this.officialList.slice();
        }

        this._changeDetectorRef.markForCheck();
    }

    optionClicked(event: Event, func: any) {
        event.stopPropagation();
        this.toggleSelection(func);
    }

    toggleSelection(func: any) {

        const selected = this.selectedFunc.find(item => item.id_funcionario === func.id_funcionario);
        if (!selected) {
            this.selectedFunc.push(func);
        } else {
            const i = this.selectedFunc.findIndex(value => value.desc_funcionario2 === func.desc_funcionario2);
            this.selectedFunc.splice(i, 1);
        }
        this.roleForm.get('officials').setValue(this.selectedFunc);
        this._changeDetectorRef.markForCheck();
    }

    checkedOption(func: any): boolean{
        return this.selectedFunc.find(item => item.id_funcionario === func.id_funcionario);
    }

    /**
     * load Funcionario
     */
    searchFuncionario(query: string): void
    {
        this._reclamoService.searchFuncionario(query).subscribe(
            (list) => {
                this.officialList = list;
            }
        );
    }

    displayFn(value: any[] | string): string | undefined {
        let displayValue: string = '';
        if (Array.isArray(value)) {
            value.forEach((func, index) => {
                if (index === 0) {
                    displayValue = func.desc_funcionario2;
                } else {
                    displayValue += ', ' + func.desc_funcionario2;
                }
            });
        } else {
            displayValue = value;
        }
        return displayValue;
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._rolesListComponent.matDrawer.close();
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
     * Update the role
     */
    updateRole(): void
    {
        // Get the role object
        const role = this.roleForm.getRawValue();

        //this.role.states = this.roleForm.get('states').value;
        this._changeDetectorRef.markForCheck();

        this._rolesService.saveRole(role)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
               if (!response.error){
                   // Toggle the edit mode off
                   this.toggleEditMode(false);
               }
            });
    }

    /**
     * Delete the role
     */
    deleteRole(): void
    {
        // Open the confirmation dialog
        const confirmation = this._bobyConfirmationService.open({
            title  : 'Borrar Rol',
            message: 'Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer!',
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
                const id = this.role.id;
                const id_rol = this.role.id_rol;

                // Get the next/previous role's id
                const currentContactIndex = this.roles.findIndex(item => item.id === id);
                const nextContactIndex = currentContactIndex + ((currentContactIndex === (this.roles.length - 1)) ? -1 : 1);
                const nextContactId = (this.roles.length === 1 && this.roles[0].id === id) ? null : this.roles[nextContactIndex].id;

                // Delete the role
                this._rolesService.deleteRole(id_rol)
                    .subscribe((isDeleted) => {

                        // Return if the role wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }

                        // Navigate to the next role if available
                        if ( nextContactId )
                        {
                            this._router.navigate(['../', nextContactId], {relativeTo: this._activatedRoute});
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

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void
    {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void
    {
        // Return if the pressed key is not 'Enter'
        if ( event.key !== 'Enter' )
        {
            return;
        }

        // If there is no tag available...
        if ( this.filteredTags.length === 0 )
        {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.role.tags.find(id => id === tag.id);

        // If the found tag is already applied to the role...
        if ( isTagApplied )
        {
            // Remove the tag from the role
            this.removeTagFromContact(tag);
        }
        else
        {
            // Otherwise add the tag to the role
            this.addTagToContact(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void
    {
        const tag = {
            title
        };

        // Create tag on the server
        this._rolesService.createTag(tag)
            .subscribe((response) => {

                // Add the tag to the role
                this.addTagToContact(response);
            });
    }

    /**
     * Add tag to the role
     *
     * @param tag
     */
    addTagToContact(tag: any): void
    {
        // Add the tag
        this.role.tags.unshift(tag.id);

        // Update the role form
        this.roleForm.get('tags').patchValue(this.role.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the role
     *
     * @param tag
     */
    removeTagFromContact(tag: any): void
    {
        // Remove the tag
        this.role.tags.splice(this.role.tags.findIndex(item => item === tag.id), 1);

        // Update the role form
        this.roleForm.get('tags').patchValue(this.role.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
     * Add the permitsClaim field
     */
    addPermitsClaimField(): void
    {
        // Create an empty email form group
        const permissionFormGroup = this._formBuilder.group({
            permission: [[]],
            states: [[]]
        });

        // Add the email form group to the emails form array
        (this.roleForm.get('permitsClaim') as FormArray).push(permissionFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the permitsClaim field
     *
     * @param index
     */
    removePermitsClaimField(index: number): void
    {
        // Get form array for users
        const usersFormArray = this.roleForm.get('permitsClaim') as FormArray;

        // Remove the user field
        usersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add the permits Answer field
     */
    addPermitsAnswerField(): void
    {
        // Create an empty email form group
        const permissionFormGroup = this._formBuilder.group({
            permission: [[]],
            states: [[]]
        });

        // Add the email form group to the emails form array
        (this.roleForm.get('permitsAnswer') as FormArray).push(permissionFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the permits Answer field
     *
     * @param index
     */
    removePermitsAnswerField(index: number): void
    {
        // Get form array for users
        const usersFormArray = this.roleForm.get('permitsAnswer') as FormArray;

        // Remove the user field
        usersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add the permits Report field
     */
    addPermitsReportField(): void
    {
        // Create an empty email form group
        const permissionFormGroup = this._formBuilder.group({
            permission: [[]],
            states: [[]]
        });

        // Add the email form group to the emails form array
        (this.roleForm.get('permitsReport') as FormArray).push(permissionFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the permits Report field
     *
     * @param index
     */
    removePermitsReportField(index: number): void
    {
        // Get form array for users
        const usersFormArray = this.roleForm.get('permitsReport') as FormArray;

        // Remove the user field
        usersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
