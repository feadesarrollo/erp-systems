import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit, Renderer2,
    TemplateRef,
    ViewChild, ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {FileManagerListComponent} from "../file-manager-list/file-manager-list.component";
import {FileManagerService} from "../file-manager.service";
import {MatDrawerToggleResult} from "@angular/material/sidenav";
import * as moment from "moment";
import {FileManagerViewComponent} from "../file-manager-view/file-manager-view.component";

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

    public listContractType: any = [];
    public listAddenda: any = [];
    public category: any = '';
    public type: any = '';
    private configForm: FormGroup;
    private childId: any;
    private parentId: any;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _overlay: Overlay,
        private _renderer2: Renderer2,
        private _viewContainerRef: ViewContainerRef,
        private _route: ActivatedRoute,
        private _matDialog: MatDialog,
        private _fcService: BobyConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _fileService: FileManagerService,
        private _fileManagerListComponent: FileManagerListComponent
    ) { }

    ngOnInit(): void {

        this.childId = this._activatedRoute.snapshot.paramMap.get('id');
        this.parentId = this._activatedRoute.parent.snapshot.paramMap.get('folderId');
        // Open the drawer
        this._fileManagerListComponent.matDrawer.open();
        this._changeDetectorRef.markForCheck();

        // Create the role form
        this.fileManagerForm = this._formBuilder.group({
            id                   : '',
            name                 : ['',[Validators.required]],
            format               : [''],
            createdBy            : [''],
            createdAt            : [''],
            modifiedAt           : [''],
            id_tipo_contrato     : [''],
            category             : [''],
            type                 : ['',[Validators.required]],
            description          : ['',[Validators.required]],
            id_template          : '',
            unit_list            : [''],
            id_template_fk       : ''
        });

        this._fileService.getContractType()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((list: any[]) => {
                this.listContractType = list;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._fileService.getAddenda()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((list: any[]) => {
                console.warn('list',list);
                this.listAddenda = list;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the item
        this._fileService.item$
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

    displayContractType(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    displayAddenda(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * Change value incident type
     */
    onCategoryChange(ev){
        this.category = ev.value;
    }

    /**
     * Change value incident type
     */
    onTypeChange(ev){
        this.type = ev.value;
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
     * @ id of record
     */
    updateTemplateFile(){

        const file = {
            id               : this._route.snapshot.paramMap.get('id'),
            folderId         : this.parentId,
            name             : this.fileManagerForm.get('name').value,
            format           : this.fileManagerForm.get('format').value,
            createdBy        : JSON.parse(localStorage.getItem('aut')).user,
            createdAt        : this.item.json_template.createdAt ? this.item.json_template.createdAt : moment().format('DD/MM/YYYY'),
            modifiedAt       : moment().format('DD/MM/YYYY'),
            id_tipo_contrato : +this.fileManagerForm.get('id_tipo_contrato').value,
            category         : this.fileManagerForm.get('category').value,
            type             : this.fileManagerForm.get('type').value,
            description      : this.fileManagerForm.get('description').value,
            id_template      : this.item.id_template,
            unit_list        : this.fileManagerForm.get('unit_list').value,
            id_template_fk   : this.fileManagerForm.get('id_template_fk').value,
        };

        this._fileService.item = {json_template: file};
        this._fileService.postTemplateFile(file)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                file.id_template = response.data.id_template;
                this._fileService.item = {json_template: file};
                if (!response.error){
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                    this._fileService.getTemplateFile(this.parentId).subscribe();
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
                this._fileService.deleteTemplateFile(this.item.id_template)
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

}
