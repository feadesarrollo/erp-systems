import { ChangeDetectionStrategy, ViewEncapsulation, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AddPermissions} from "../../../../../store/claims-management/claims-management.actions";
import {PermissionsService} from "../permissions/permissions.service";
import { takeUntil, Subject } from 'rxjs';
import {HumanTalentService} from "../human-talent.service";

@Component({
    selector: 'erp-human-talent-menu',
    templateUrl: './human-talent-menu.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HumanTalentMenuComponent implements OnInit {


    public dataUser = JSON.parse(localStorage.getItem('aut'));

    public avatar:string = `https://erp.boa.bo/uploaded_files/sis_parametros/Archivo/${this.dataUser.logo}`;
    public name:string = `${this.dataUser.nombre_usuario}`;

    public selectedProject: string = 'ACME Corp. Backend App';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    parameterList: any = [];
    processList: any = [];
    reportList: any = [];
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _admin: PermissionsService,
        private _htService: HumanTalentService
    ) { }

    ngOnInit(): void {
       // console.warn('_activatedRoute', this._activatedRoute.snapshot.queryParamMap);

        this._admin.rolesByOfficial$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((rolesByOff: any) => {
                //rolesByOff.permissionModule.fi
                /*const modules = rolesByOff.permissionModule.reduce((accumulator, key) => {
                    return accumulator.concat(key.modules);
                }, []);*/

                const modules = rolesByOff.map( role => role.permissionModule.reduce((accumulator, key) => {
                        return accumulator.concat(key.modules);
                    }, [])
                ).flat(1);

                this._htService.getModulesByRoles(modules).subscribe(
                    (response:any) => {
                        const list =  JSON.parse(response.datos[0].djson);
                        this.processList = list.filter(item => item.type == 'processes');
                        this.reportList = list.filter(item => item.type == 'report');
                        this.parameterList = list.filter(item => item.type == 'settings');

                        this._changeDetectorRef.markForCheck();
                    }
                );

                //this.processList = rolesByOff;//.filter(item => item.code ==);

                //this._store.dispatch(new AddPermissions(this.officialRoles));

                /*let statesByOff = [];
                rolesByOff.states.map(item => {
                    statesByOff = [...statesByOff,{id:item, nombre:item.split('_').map(str => str.toUpperCase()).join(' ')}]
                });*/

                //this.statesByOfficial = statesByOff;
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
    }

    redirect(url: string){
        this._router.navigate([`/system/human-talent/${url}`]/*, {relativeTo: this._activatedRoute}*/);
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
}
