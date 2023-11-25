import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ElementRef, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import { FileManagerListComponent } from "../file-manager-list/file-manager-list.component";
import { FileManagerService } from '../file-manager.service';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ClaimsService } from "../../../claims/claims.service";
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from 'moment';
import { AdministratorService } from '../../administrator.service';
import { MatDialog } from "@angular/material/dialog";
import { FileManagerViewComponent } from '../file-manager-view/file-manager-view.component';
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";

@Component({
    selector: 'erp-file-manager-details',
    templateUrl: './file-manager-details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerDetailsComponent implements OnInit {

    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;

    public item: any = [];
    public tags: any[];
    public tagsEditMode: boolean = false;
    public filteredTags: any[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _tagsPanelOverlayRef: OverlayRef;
    public fileManagerForm: FormGroup;
    public editMode: boolean = false;

    public listIncidentType: any = [];
    public category: any = '';
    public type: any = '';
    private configForm: FormGroup;
    private childId: any;
    private parentId: any;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: FileManagerService,
        private _formBuilder: FormBuilder,
        private _overlay: Overlay,
        private _renderer2: Renderer2,
        private _viewContainerRef: ViewContainerRef,
        private _claimService: ClaimsService,
        private _route: ActivatedRoute,
        private _adminService: AdministratorService,
        private _matDialog: MatDialog,
        private _fcService: BobyConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute
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

        this.childId = this._activatedRoute.snapshot.paramMap.get('id');
        this.parentId = this._activatedRoute.parent.snapshot.paramMap.get('folderId');
        // Open the drawer
        this._fileManagerListComponent.matDrawer.open();
        this._changeDetectorRef.markForCheck();

        // Create the role form
        this.fileManagerForm = this._formBuilder.group({
            id                  : [''],
            name                : ['',[Validators.required]],
            format              : [''/*,[Validators.required]*/],
            createdBy           : [''],
            createdAt           : [''],
            modifiedAt          : [''],
            contents            : [''],
            category            : [''/*,[Validators.required]*/],
            type                : [''/*,[Validators.required]*/],
            description         : ['',[Validators.required]],
            id_tipo_incidente   : ['']
        });

        this._claimService.loadTipoIncidente()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((list: any[]) => {
                this.listIncidentType = list;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._claimService.getCategoryList('fa')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: any[]) => {
                this.filteredTags = tags;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the item
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {

                // Open the drawer in case it is closed
                this._fileManagerListComponent.matDrawer.open();

                // Get the item
                this.item = item;

                this.fileManagerForm.patchValue(this.item.json_template);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    displayIncidentType(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Change value incident type
     */
    onTypeChange(ev){
       this.type = ev.value;
    }

    /**
     * Change value incident type
     */
    onCategoryChange(ev){
        this.category = ev.value;
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
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._fileManagerListComponent.matDrawer.close();
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
     * @ id of record
     */
    deleteTemplateFile(){

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `Estimado Usuario, esta seguro de eliminar el registro?`,
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
                this._fileManagerService.deleteTemplateFile(this.item.id_template)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {
                        if (!response.error){
                            // Toggle the edit mode off
                            this.toggleEditMode(false);
                            this._router.navigate(['../../'], {relativeTo: this._activatedRoute});
                        }
                    });
            }else{

            }
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
     * @ id of record
     */
    updateTemplateFile(){

        const file = {
            id         : this._route.snapshot.paramMap.get('id'),
            folderId   : this.parentId,
            name       : this.fileManagerForm.get('name').value,
            format     : this.fileManagerForm.get('format').value,
            createdBy  : JSON.parse(localStorage.getItem('aut')).user,
            createdAt  : this.item.json_template.createdAt ? this.item.json_template.createdAt : moment().format('DD/MM/YYYY'),
            modifiedAt : moment().format('DD/MM/YYYY'),
            contents   : this.fileManagerForm.get('contents').value,
            description: this.fileManagerForm.get('description').value,
            category   : this.fileManagerForm.get('category').value,
            type   : this.fileManagerForm.get('type').value,
            id_template: this.item.id_template,
            id_tipo_incidente: +this.fileManagerForm.get('id_tipo_incidente').value,
        };

        this._fileManagerService.item = {json_template: file};
        this._adminService.postTemplateFile(file)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                file.id_template = response.data.id_template;
                this._fileManagerService.item = {json_template: file};
                if (!response.error){
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                    this._fileManagerService.getTemplateFile(this.parentId).subscribe();
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    }
                ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )
            {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
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

    editTemplateContent()
    {
        // Open the dialog
        const dialogRef = this._matDialog.open(FileManagerViewComponent,{
            data: {
                id: this._route.snapshot.paramMap.get('id'),
                item: this.item
            },
            disableClose: true
        });

        dialogRef.afterClosed()
            .subscribe((result) => {
                this._fileManagerListComponent.updateTemplate(result,this.item.id_template);
            });
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    /*filterTagsInputKeyDown(event): void
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
        const isTagApplied = this.contact.tags.find(id => id === tag.id);

        // If the found tag is already applied to the contact...
        if ( isTagApplied )
        {
            // Remove the tag from the contact
            this.removeTagFromContact(tag);
        }
        else
        {
            // Otherwise add the tag to the contact
            this.addTagToContact(tag);
        }
    }*/

    /**
     * Create a new tag
     *
     * @param title
     */
    /*createTag(title: string): void
    {
        const tag = {
            title
        };

        // Create tag on the server
        this._contactsService.createTag(tag)
            .subscribe((response) => {

                // Add the tag to the contact
                this.addTagToContact(response);
            });
    }*/

    /**
     * Add tag to the contact
     *
     * @param tag
     */
    /*addTagToContact(tag: Tag): void
    {
        // Add the tag
        this.contact.tags.unshift(tag.id);

        // Update the contact form
        this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }*/

    /**
     * Remove tag from the contact
     *
     * @param tag
     */
    /*removeTagFromContact(tag: any): void
    {
        // Remove the tag
        this.contact.tags.splice(this.contact.tags.findIndex(item => item === tag.id), 1);

        // Update the contact form
        this.contactForm.get('tags').patchValue(this.contact.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }*/

}
