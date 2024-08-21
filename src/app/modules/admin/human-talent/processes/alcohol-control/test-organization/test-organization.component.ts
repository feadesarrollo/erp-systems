import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { HumanTalentService } from "../../../human-talent.service";
import { BobyLoadingService } from "@boby/services/loading";
import { TreeNode } from "primeng/api";
import { debounceTime, map, switchMap, takeUntil} from "rxjs/operators";
import { PermissionsService } from "../../../permissions/permissions.service";
import { Subject,combineLatest } from "rxjs";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import {ViewDocumentDialogComponent} from "../details-officials/view-document-dialog/view-document-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {environment} from "../../../../../../../environments/environment";

@Component({
  selector: 'erp-test-organization',
  templateUrl: './test-organization.component.html',
  styleUrls: ['./test-organization.component.scss']
})
export class TestOrganizationComponent implements OnInit {

    public loading: boolean;
    public organization: TreeNode[] = [];
    public nodes: any = [];
    public allowed: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public searchInputControl: FormControl = new FormControl();
    public organizationUnits: any = [];
    public viewer_file: string ='url';

    private id = 0;
    constructor(
        private _htService: HumanTalentService,
        private _loadService: BobyLoadingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _roles: PermissionsService,
        private _matDialog: MatDialog,
    ) { }


    ngOnInit(): void {
        this._htService.getOrganizationalUnits('').subscribe(
            (resp) => {
                this.organizationUnits = resp;
            }
        );

        this._roles.getRolesByOfficial()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles)=>{
                this.allowed = roles.find(sys => sys.permissionModule.find(mod=> mod.modules.includes('programa-psicoactivo'))).permissionModule.find(allow => allow.permission).permission;
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((value) => {
                    this._loadService.show();
                    if ( typeof value === 'string') {
                        if ( value === '' ){
                            this.nodes = [];this.id = 0;
                        }
                        return combineLatest({units:this._htService.getOrganizationalUnits(value), type:'string'});
                    }else if ( typeof value === 'number' ){
                        this.id = value;
                        return combineLatest({units:this._htService.getNodes(value,'base'), type:'number'});
                    }
                }),
                map(({units, type}) => {
                    console.warn('units',units);
                    this._loadService.hide();
                    if( type === 'r' ){
                        this.nodes = units;
                    }else if ( type === 'g' ){
                        this.organizationUnits = units;
                    }
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    refresh(){

    }

    /**
     * select Organization Unit
     */
    selectOrganizationUnit(event): void
    {

    }

    /**
     * Get Organization Unit
     */
    getOrganizationUnit(id_uo: any) {
        if (id_uo !== null && id_uo !== undefined && id_uo !== '')
            return this.organizationUnits.find(unit => unit.id_uo === id_uo).nombre_unidad;
    }

    /**
     * Action archivo
     */
    viewDocument(document:any): void {
        if (document?.document_path) {
            this.viewer_file = 'url';
            document.viewer_file = this.viewer_file;
            const dialogRef = this._matDialog.open(ViewDocumentDialogComponent, {
                data: document
            });

            dialogRef.afterClosed()
                .subscribe((result) => {

                });
        }else{

        }
    }

    generateTestReport(){
        this._loadService.show();
        this._htService.generateTestReport(this.id).subscribe(
            (resp)=>{
                this._loadService.hide();
                window.open(`${environment.filesUrl}reportes_generados/${resp.detail.archivo_generado}`);
            }
        )
    }
}
