import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {OverlayRef} from "@angular/cdk/overlay";
import { Subject, takeUntil } from 'rxjs';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {OrganizationChartListComponent} from "../organization-chart-list/organization-chart-list.component";
import {HumanTalentService} from "../../../human-talent.service";
import {MatDrawerToggleResult} from "@angular/material/sidenav";

@Component({
    selector: 'erp-organization-chart-details',
    templateUrl: './organization-chart-details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationChartDetailsComponent implements OnInit {


    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _tagsPanelOverlayRef: OverlayRef;

    public editMode: boolean = false;
    public OrgaChartForm: FormGroup;
    public organization: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _orgaChartComponent: OrganizationChartListComponent,
        private _humanTalentService: HumanTalentService
    ) { }

    ngOnInit(): void {
        this._orgaChartComponent.matDrawer.open();

        this.OrgaChartForm = this._formBuilder.group({
            id_uo: [''],
            codigo: ['',[Validators.required]],
            id_nivel_organizacional: ['',[Validators.required]],
            nombre_unidad: ['',[Validators.required]],
            descripcion: ['',[Validators.required]],
            nombre_cargo: ['',[Validators.required]],
            cargo_individual: ['',[Validators.required]],
            presupuesta: ['',[Validators.required]],
            nodo_base: ['',[Validators.required]],
            correspondencia: ['',[Validators.required]],
            gerencia: ['',[Validators.required]]
        });

        // Get the customer
        this._humanTalentService.organization$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((organization: any) => {
                // Open the drawer in case it is closed
                this._orgaChartComponent.matDrawer.open();

                // Get the customer
                this.organization = organization;
                this.OrgaChartForm.patchValue(organization);

                // Toggle the edit mode off
                this.toggleEditMode(false);
                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._orgaChartComponent.matDrawer.close();
    }

    uploadAvatar(files){}

    removeAvatar(){}

    /**
     * save Customer
     */
    postOrganization() {}
    deleteOrganization(){}
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
}
