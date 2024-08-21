import {
    ChangeDetectorRef,
    Component,
    OnInit,
    Input,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ElementRef,
    ViewEncapsulation, ChangeDetectionStrategy
} from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnter, CdkDragExit } from '@angular/cdk/drag-drop';
import { HumanTalentService } from "../../../human-talent.service";
import { ActivatedRoute, Router } from "@angular/router";
import {CalendarEventPanelMode, CalendarEventEditMode} from '../../../human-talent.types';
import * as moment from 'moment';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {MessageService} from "primeng/api";
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";
import {WizardDialogComponent} from "../../../../claims-management/claims/claim/wizard-dialog/wizard-dialog.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {BobyConfirmationService} from "../../../../../../../@boby/services/confirmation";
import {ViewDocGenDialogComponent} from "../view-doc-gen-dialog/view-doc-gen-dialog.component";
import { Subject,of } from 'rxjs';
import {MatMenuTrigger} from "@angular/material/menu";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatChipInputEvent} from "@angular/material/chips";
import { filter, switchMap, takeUntil } from "rxjs/operators";
import {PermissionsService} from "../../../permissions/permissions.service";
import {AlcoholControlComponent} from "../alcohol-control.component";

@Component({
    selector: 'erp-list-lottery-control',
    templateUrl: './list-lottery-control.component.html',
    styleUrls: ['./list-lottery-control.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListLotteryControlComponent implements OnInit {

    public groups: any[] = [];
    public weeks: any[] = [];

    public field = 'Editar';

    public allDropListsIds: string[] = [];

    @ViewChild('eventPanel') private _eventPanel: TemplateRef<any>;
    @ViewChild('managerPanel') private _managerPanel: TemplateRef<any>;
    //@ViewChild('infoDetailsPanelOrigin') private _infoDetailsPanelOrigin: any;

    @Input() item?: any;
    @Input() parentItem?: any;
    @Input() public set connectedDropListsIds(ids: string[]) {
        this.allDropListsIds = ids;
    }

    panelMode: CalendarEventPanelMode = 'view';
    eventEditMode: CalendarEventEditMode = 'single';
    private _eventPanelOverlayRef: OverlayRef;

    private configForm: FormGroup;
    private selected: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /*************************** VAR CALENDAR *******************************/
    MONTH_NAMES = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'Diciembre'
    ];
    DAYS = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    days = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    showDatepicker = true;
    datepickerValue!: string;
    month!: number; // !: mean promis it will not be null, and it will definitely be assigned
    year!: number;
    no_of_days = [] as number[];
    blankdays = [] as number[];

    public event: any;
    private row:any;
    private col:any;
    public organizationalUnits: any;
    public eventForm: FormGroup;
    public managerForm: FormGroup;
    /*************************** VAR CALENDAR *******************************/

    @ViewChild('clickMenuTrigger') clickMenuTrigger: MatMenuTrigger;
    contextMenuPosition = { x: '0px', y: '0px' };
    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('managerInput') managerInput: ElementRef<HTMLInputElement>;
    @ViewChild('managerAuto') matAutocomplete: MatAutocomplete;
    @ViewChild('autocompleteTrigger') matManagerTrigger: MatAutocompleteTrigger;
    public listOfficials: any = [];
    managers: any = [];
    selectable = true;
    removable = true;
    public allowed: any;
    public name:string;
    private schedule: any;

    public color_list: any = ['text-red-500','text-amber-500','text-lime-500','text-green-500','text-cyan-500',
        'text-sky-500','text-purple-500','text-pink-500','text-rose-500','text-orange-500',
        'text-yellow-500','text-emerald-500','text-teal-500','text-sky-500','text-blue-500',
        'text-indigo-500','text-violet-500','text-fuchsia-500'];
    constructor(
        private _route: ActivatedRoute,
        private _htService: HumanTalentService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _messageService: MessageService,
        private _loadService: BobyLoadingService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _fcService: BobyConfirmationService,
        private _elementRef: ElementRef,
        private _roles: PermissionsService
    ) { }

    ngOnInit(): void {

        this.name = JSON.parse(localStorage.getItem('aut')).nombre_usuario;
        this._htService.lottery$
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((raffle)=>{
                    return of(raffle??true);
                })
            ).subscribe((lottery: any)=>{
                if (lottery) {
                    if( typeof lottery === 'boolean' ){
                        this._htService.getLotteryOfDays().subscribe();
                    }else {
                        this.selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));
                        if (['borrador_ps'].includes(this.selected.estado)) {
                            this.field = 'Editar Planificación';
                        } else if (['editado_ps'].includes(this.selected.estado)) {
                            this.field = 'Validar Planificación';
                        } else if (['elaborado_ps'].includes(this.selected.estado)) {
                            this.field = 'Aprobar Planificación';
                        } else {
                            this.field = 'aprobado_ps';
                        }

                        let today = new Date(this.selected.start_range.split('/').reverse().join('-'));
                        today.setDate(today.getDate() + 1);
                        this.month = today.getMonth();
                        this.year = today.getFullYear();

                        if (this.selected)
                            this.weeks = this.selected.lottery_of_days;

                        this._changeDetectorRef.markForCheck();
                    }
                }
        });

        this._htService.getOrganizationalUnits('').subscribe(
            (resp) => {
                this.organizationalUnits = resp;
            }
        );

        this._roles.getRolesByOfficial()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((roles)=>{
                this.allowed = roles.find(sys => sys.permissionModule.find(mod=> mod.modules.includes('programa-psicoactivo'))).permissionModule.find(allow => allow.permission).permission;
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

    /**
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
        this._htService.filterByQuery(query, 0, 6).subscribe(
            (resp: any) => {

                this._changeDetectorRef.markForCheck();
            }
        );
    }

    /****************************************** CALENDAR ******************************************/
    enter(schedule){
        this.schedule = schedule;
    }

    drop(event: CdkDragDrop<any>, dayObj) {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            /******************************* BEGIN SAVE DROP *******************************/
            this.schedule ={...this.schedule,day:dayObj.day,date:dayObj.date};
            this._loadService.show();
                this._htService.savePlanning(this._route.snapshot.paramMap.get('id'), this.weeks, this.schedule).subscribe(
                (resp)=>{
                    this._loadService.hide();
                    if ( resp.error ){
                        this._messageService.add({
                            severity: 'error',
                            summary: 'ADVERTENCIA',
                            detail: resp.message,
                            life: 9000
                        });
                    }else{
                        this._htService.lottery$.subscribe((lottery)=>{
                            if (lottery) {
                                const selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));

                                let today = new Date(selected.start_range.split('/').reverse().join('-'));
                                today.setDate(today.getDate() + 1);
                                this.month = today.getMonth();
                                this.year = today.getFullYear();

                                if (selected)
                                    this.weeks = selected.lottery_of_days;

                                this._changeDetectorRef.markForCheck();

                            }

                        });
                    }
                }
            );
            /******************************* END SAVE DROP *******************************/
        }

    }

    savePlanning(){
        this._loadService.show();
        this._htService.savePlanning(this._route.snapshot.paramMap.get('id'), this.weeks, this.schedule).subscribe(
            (resp)=>{
                this._loadService.hide();
                if ( resp.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: resp.message,
                        life: 9000
                    });
                }else{
                    this._htService.lottery$.subscribe((lottery)=>{
                        if (lottery) {
                            const selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));

                            let today = new Date(selected.start_range.split('/').reverse().join('-'));
                            today.setDate(today.getDate() + 1);
                            this.month = today.getMonth();
                            this.year = today.getFullYear();

                            if (selected)
                                this.weeks = selected.lottery_of_days;

                            this._changeDetectorRef.markForCheck();

                        }

                    });
                }
            }
        );
    }

    executeCommand(valor: string){
        switch (valor) {

            case 'report':
                this._loadService.show();
                this._htService.psychoactiveProgramReport(this.selected.id_proceso_wf, 'sis_organigrama/control/SorteoPruebaPsicoActiva/psychoactiveProgramReport/')
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response) => {
                        this._loadService.hide();
                        const detalle = response.detail;
                        this.selected.archivo_generado = detalle.message;
                        this.selected.viewer_file = 'url';
                        const dialogRef = this._matDialog.open(ViewDocGenDialogComponent, {
                            data: this.selected
                        });

                        dialogRef.afterClosed()
                            .subscribe((result) => {

                            });
                    });
                break;
        }
    }

    enablePlanning(){

        const dialogRef = this._matDialog.open(WizardDialogComponent, {
            height: '90%',
            width: '70%',
            data: {
                id_proceso_wf: this.selected.id_proceso_wf,
                id_estado_wf: this.selected.id_estado_wf,
                endpoint:'organigrama/SorteoPruebaPsicoActiva/siguienteEstado'
            }
        });

        dialogRef.afterClosed()
        .subscribe((result) => {
            if (result != undefined) {
                if ( result.error ) {
                    // Build the config form
                    this.configForm = this._formBuilder.group({
                        title: 'Alerta',
                        message: `<p class="font-bold">${result.message}</p>`,
                        icon: this._formBuilder.group({
                            show: true,
                            name: 'heroicons_outline:exclamation',
                            color: 'warn'
                        }),
                        actions: this._formBuilder.group({
                            confirm: this._formBuilder.group({
                                show: true,
                                label: 'Aceptar',
                                color: 'warn'
                            }),
                            cancel: this._formBuilder.group({
                                show: false,
                                label: 'Cancelar'
                            })
                        }),
                        dismissible: true
                    });

                    const dialogRef = this._fcService.open(this.configForm.value);

                    dialogRef.afterClosed().subscribe((result) => {

                    });
                }else{
                    this._htService.getLotteryOfDays().subscribe();
                }
            }
        });
    }

    checkEmptyObject(dayObj){

        return !!Object.keys(dayObj).length;
        /*if ( Object.entries(dayObj).length === 0 ){
            return true;
        }else{
            return false;
        }*/

    }

    checkSchedule(dayObj){
        return dayObj.schedules != undefined && dayObj.schedules.length > 0;
    }

    initDate() {
        let today = new Date();
        this.month = today.getMonth();
        this.year = today.getFullYear();
        this.datepickerValue = new Date(this.year, this.month, today.getDate()).toDateString();
    }

    isToday(date: any) {
        const today = new Date();
        const d = new Date(this.year, this.month, date);
        return today.toDateString() === d.toDateString() ? true : false;
    }

    getDateValue(date: any) {
        let selectedDate = new Date(this.year, this.month, date);
        this.datepickerValue = selectedDate.toDateString();
        //this.showDatepicker = false;
    }

    getNoOfDays() {
        const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

        // find where to start calendar day of week
        let dayOfWeek = new Date(this.year, this.month).getDay();
        let blankdaysArray = [];
        for (var i = 1; i <= dayOfWeek; i++) {
            blankdaysArray.push(i);
        }

        let daysArray = [];
        for (var i = 1; i <= daysInMonth; i++) {
            daysArray.push(i);
        }

        this.blankdays = blankdaysArray;
        this.no_of_days = daysArray;
    }

    trackByIdentity = (index: number, item: any) => item;


    changeEventPanelMode(panelMode: CalendarEventPanelMode, eventEditMode: CalendarEventEditMode = 'single'): void
    {
        // Set the panel mode
        this.panelMode = panelMode;

        // Set the event edit mode
        this.eventEditMode = eventEditMode;
    }

    deleteEvent(): void {

        this.weeks.forEach((item, index) => {
            item.forEach((elem, ind) => {
                if (elem.id == this.event.id) {
                    this.row = index;
                    this.col = ind;
                }
            })
        });

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `<p class="font-bold">Estimado Usuario: Esta seguro de eliminar el plan?.</p>`,
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Aceptar',
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

        dialogRef.afterClosed().subscribe((result) => {
            if ( result == 'confirmed' ){
                let deletedPlan = this.weeks[this.row][this.col].schedules[0];
                //delete(this.weeks[this.row][this.col]);
                this.weeks[this.row][this.col].schedules = [];
                this._closeEventPanel();
                this._changeDetectorRef.markForCheck();

                /******************************* BEGIN SAVE DELETE *******************************/
                this._loadService.show();
                this._htService.saveModifiedPlanning(this._route.snapshot.paramMap.get('id'), this.weeks, deletedPlan, {},'delete').subscribe(
                    (resp)=>{
                        this._loadService.hide();
                        if ( resp.error ){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        }else{

                            this._messageService.add({
                                severity: 'success',
                                summary: 'EXITO',
                                detail: resp.message,
                                life: 9000
                            });

                            this._htService.lottery$.subscribe((lottery)=>{
                                if (lottery) {
                                    const selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));

                                    let today = new Date(selected.start_range.split('/').reverse().join('-'));
                                    today.setDate(today.getDate() + 1);
                                    this.month = today.getMonth();
                                    this.year = today.getFullYear();

                                    if (selected)
                                        this.weeks = selected.lottery_of_days;

                                    this._changeDetectorRef.markForCheck();

                                }

                            });
                        }
                    }
                );
                /******************************* END SAVE DELETE *******************************/
            }else{

            }
        });

    }

    /**
     * display Units
     */
    displayUnits(attribute1,attribute2) {
        if (attribute1 == attribute2) {
            return attribute1;
        } else {
            return "";
        }
    }

    /**
     * load Organization Unit
     */
    selectionOrganizationalUnits(event): void
    {
        let selectedUnit = this.organizationalUnits.find(uo => uo.id_uo === event.value);
        /******************************************* UPDATE UNIT *******************************************/

        this.weeks.forEach((item, index) => {
            item.forEach((elem, ind) => {
                if (elem.id == this.event.id) {
                    this.row = index;
                    this.col = ind;
                }
            })
        });

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `<p class="font-bold">Estimado Usuario: Esta seguro de cambiar la unidad del plan?.</p>`,
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'Aceptar',
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

        dialogRef.afterClosed().subscribe((result) => {
            if ( result == 'confirmed' ){

                const schedules = this.weeks[this.row][this.col].schedules[0];
                this.weeks[this.row][this.col].schedules[0].id_uo = selectedUnit.id_uo;
                this.weeks[this.row][this.col].schedules[0].name = selectedUnit.nombre_unidad;
                //this._closeEventPanel();
                this._changeDetectorRef.markForCheck();
                /******************************* BEGIN SAVE DELETE *******************************/
                this._loadService.show();
                this._htService.saveModifiedPlanning(this._route.snapshot.paramMap.get('id'),this.weeks,{},schedules,'update').subscribe(
                //this._htService.savePlanning(this._route.snapshot.paramMap.get('id'),this.weeks).subscribe(
                    (resp)=>{
                        this._closeEventPanel();
                        this._loadService.hide();
                        if ( resp.error ){
                            this._messageService.add({
                                severity: 'error',
                                summary: 'ADVERTENCIA',
                                detail: resp.message,
                                life: 9000
                            });
                        }else{
                            this._htService.lottery$.subscribe((lottery)=>{
                                if (lottery) {
                                    const selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));

                                    let today = new Date(selected.start_range.split('/').reverse().join('-'));
                                    today.setDate(today.getDate() + 1);
                                    this.month = today.getMonth();
                                    this.year = today.getFullYear();

                                    if (selected)
                                        this.weeks = selected.lottery_of_days;

                                    this._changeDetectorRef.markForCheck();

                                }

                            });
                        }
                        //this.organizationalUnits = [];
                    }
                );
                /******************************* END SAVE DELETE *******************************/
            }
        });
        /******************************************* UPDATE UNIT *******************************************/
        /*this._htService.searchOrganizationalUnits(query, 0,7).subscribe(
            (resp) => {
                this.organizationalUnits = resp;
            }
        );*/
    }

    /**
     * load Oficina
     */
    searchOrganizationalUnits(query): void
    {
        this._htService.searchOrganizationalUnits(query, 0,7).subscribe(
            (resp) => {
                this.organizationalUnits = resp;
            }
        );
    }

    /**
     * Get Nombre Oficina Incidente
     */
    getOrganizationalUnits(id_uo: string) {
        if ( this.organizationalUnits?.length ) {
            if ( this.event.schedules[0].id_uo != id_uo ){
                let selectedUnit = this.organizationalUnits.find(uo => uo.id_uo === id_uo);
                /******************************************* UPDATE UNIT *******************************************/

                this.weeks.forEach((item, index) => {
                    item.forEach((elem, ind) => {
                        if (elem.id == this.event.id) {
                            this.row = index;
                            this.col = ind;
                        }
                    })
                });

                // Build the config form
                this.configForm = this._formBuilder.group({
                    title: 'Alerta',
                    message: `<p class="font-bold">Estimado Usuario: Esta seguro de cambiar la unidad del plan?.</p>`,
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: 'Aceptar',
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

                dialogRef.afterClosed().subscribe((result) => {
                    if ( result == 'confirmed' ){

                        this.weeks[this.row][this.col].schedules[0].id_uo = selectedUnit.id_uo;
                        this.weeks[this.row][this.col].schedules[0].name = selectedUnit.nombre_unidad;

                        //this._closeEventPanel();
                        this._changeDetectorRef.markForCheck();

                        /******************************* BEGIN SAVE DELETE *******************************/
                        this._loadService.show();
                        this._htService.savePlanning(this._route.snapshot.paramMap.get('id'), this.weeks, this.schedule).subscribe(
                            (resp)=>{
                                this._loadService.hide();
                                if ( resp.error ){
                                    this._messageService.add({
                                        severity: 'error',
                                        summary: 'ADVERTENCIA',
                                        detail: resp.message,
                                        life: 9000
                                    });
                                }else{
                                    this._htService.lottery$.subscribe((lottery)=>{
                                        if (lottery) {
                                            const selected = lottery.find(item => item.id_control_sorteo_prueba == this._route.snapshot.paramMap.get('id'));

                                            let today = new Date(selected.start_range.split('/').reverse().join('-'));
                                            today.setDate(today.getDate() + 1);
                                            this.month = today.getMonth();
                                            this.year = today.getFullYear();

                                            if (selected)
                                                this.weeks = selected.lottery_of_days;

                                            this._changeDetectorRef.markForCheck();

                                        }

                                    });
                                }
                                this.organizationalUnits = [];
                            }
                        );
                        /******************************* END SAVE DELETE *******************************/
                    }
                });
                /******************************************* UPDATE UNIT *******************************************/
                return selectedUnit.nombre_unidad;
            }
        }else {
            return this.event.schedules[0].name;
        }
    }

    onEventClick(calendarEvent, dayObj): void
    {

        if (dayObj?.schedules.length > 0) {
            this.event = dayObj;
            this.eventForm = this._formBuilder.group({
                id_uo : [this.event.schedules[0].id_uo]
            });
        }
        const positionStrategy = this._overlay.position().flexibleConnectedTo(calendarEvent.target).withFlexibleDimensions(false).withPositions([
            {
                originX : 'end',
                originY : 'top',
                overlayX: 'start',
                overlayY: 'top',
                offsetX : 8
            },
            {
                originX : 'start',
                originY : 'top',
                overlayX: 'end',
                overlayY: 'top',
                offsetX : -8
            },
            {
                originX : 'start',
                originY : 'bottom',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetX : -8
            },
            {
                originX : 'end',
                originY : 'bottom',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetX : 8
            }
        ]);

        // Create the overlay if it doesn't exist
        if ( !this._eventPanelOverlayRef )
        {
            this._createEventPanelOverlay(positionStrategy);
        }
        // Otherwise, just update the position
        else
        {
            this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
        }

        // Attach the portal to the overlay
        this._eventPanelOverlayRef.attach(new TemplatePortal(this._eventPanel, this._viewContainerRef));

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create the event panel overlay
     *
     * @private
     */
    private _createEventPanelOverlay(positionStrategy): void
    {
        // Create the overlay
        this._eventPanelOverlayRef = this._overlay.create({
            panelClass    : ['calendar-event-panel'],
            backdropClass : '',
            hasBackdrop   : true,
            scrollStrategy: this._overlay.scrollStrategies.reposition(),
            positionStrategy
        });

        // Detach the overlay from the portal on backdrop click
        this._eventPanelOverlayRef.backdropClick().subscribe(() => {
            this._closeEventPanel();
        });
    }

    /**
     * Close the event panel
     *
     * @private
     */
    private _closeEventPanel(): void
    {
        // Detach the overlay from the portal
        this._eventPanelOverlayRef.detach();

        // Reset the panel and event edit modes
        this.panelMode = 'view';
        this.eventEditMode = 'single';

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /****************************************** CALENDAR ******************************************/

    public get dragDisabled(): boolean {
        return !this.parentItem;
    }
    public get parentItemId(): string {
        return this.dragDisabled ? '' : this.parentItem.id;
    }

    public get connectedDropListsIds(): string[] {
        // We reverse ids here to respect items nesting hierarchy
        return this.getIdsRecursive(this.parentItem).reverse();
    }

    private getIdsRecursive(item: any): string[] {
        let ids = [item.id];
        item.children.forEach((childItem) => {
            ids = ids.concat(this.getIdsRecursive(childItem));
        });
        return ids;
    }

    public onDragDrop(event: CdkDragDrop<any>) {
        event.container.element.nativeElement.classList.remove('active');
        if (this.canBeDropped(event)) {
            const movingItem: any = event.item.data;
            event.container.data.children.push(movingItem);
            event.previousContainer.data.children =
                event.previousContainer.data.children.filter(
                    (child) => child.uId !== movingItem.uId
                );
        } else {
            moveItemInArray(
                event.container.data.children,
                event.previousIndex,
                event.currentIndex
            );
        }
    }

    private canBeDropped(event: CdkDragDrop<any, any>): boolean {
        const movingItem: any = event.item.data;

        return (
            event.previousContainer.id !== event.container.id &&
            this.isNotSelfDrop(event) &&
            !this.hasChild(movingItem, event.container.data)
        );
    }

    private isNotSelfDrop(
        event: CdkDragDrop<any> | CdkDragEnter<any> | CdkDragExit<any>
    ): boolean {
        return event.container.data.uId !== event.item.data.uId;
    }

    private hasChild(parentItem: any, childItem: any): boolean {
        const hasChild = parentItem.children.some(
            (item) => item.id === childItem.id
        );
        return hasChild ? true : parentItem.children.some((item) => this.hasChild(item, childItem));
    }

    dropItem(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    getConnectedList(): any[] {
        return this.groups.map(x => `${x.id}`);
    }

    dropGroup(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    }

    viewDetail(item){
        this._router.navigate([`/system/human-talent/modules/processes/psychoactive-program/${this._route.snapshot.paramMap.get('id')}/details-officials/${item.id}`], {relativeTo: this._route});
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    showManager(){
        console.warn('showManager');
    }

    onRightMenu(event: MouseEvent, item: any) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.clickMenuTrigger.menuData = { 'item': item };
        this.clickMenuTrigger.menu.focusFirstItem('mouse');
        this.clickMenuTrigger.openMenu();
    }

    onContextMenuAction(calendarEvent,dayObj) {
        if (dayObj?.schedules.length > 0) {
            this.event = dayObj;
            this.managerForm = this._formBuilder.group({
                official: ['', Validators.required]
            });
            this.managers = dayObj.managers ?? [];
        }
        const positionStrategy = this._overlay.position().flexibleConnectedTo(calendarEvent.target).withFlexibleDimensions(false).withPositions([
            {
                originX : 'end',
                originY : 'top',
                overlayX: 'start',
                overlayY: 'top',
                offsetX : 8
            },
            {
                originX : 'start',
                originY : 'top',
                overlayX: 'end',
                overlayY: 'top',
                offsetX : -8
            },
            {
                originX : 'start',
                originY : 'bottom',
                overlayX: 'end',
                overlayY: 'bottom',
                offsetX : -8
            },
            {
                originX : 'end',
                originY : 'bottom',
                overlayX: 'start',
                overlayY: 'bottom',
                offsetX : 8
            }
        ]);

        // Create the overlay if it doesn't exist
        if ( !this._eventPanelOverlayRef )
        {
            this._createEventPanelOverlay(positionStrategy);
        }
        // Otherwise, just update the position
        else
        {
            this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
        }

        // Attach the portal to the overlay
        this._eventPanelOverlayRef.attach(new TemplatePortal(this._managerPanel, this._viewContainerRef));

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    selectedManager(event: MatAutocompleteSelectedEvent): void {
        const newValue = event.option.viewValue;
        if (this.managers.includes(newValue)) {
            this.managers = [...this.managers.filter(manager=>manager !== newValue)];
        } else {
            this.managers.push(event.option.viewValue);
        }
        this.managerInput.nativeElement.value = '';
        this.managerForm.get('official').setValue('');

        // keep the autocomplete opened after each item is picked.
        requestAnimationFrame(()=>{
            this.openAuto(this.matManagerTrigger);
        })

    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            this.managers.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.managerForm.get('official').setValue('');
    }

    openAuto(trigger: MatAutocompleteTrigger) {
        trigger.openPanel();
        this.managerInput.nativeElement.focus();
    }

    remove(manager: string): void {
        const index = this.managers.indexOf(manager);

        if (index >= 0) {
            this.managers.splice(index, 1);
        }
    }

    /**
     * load Funcionario
     */
    searchOfficial(query: string, status: string): void
    {
        this._htService.searchFuncionario(query).subscribe(
            (lists) => {
                this.listOfficials = lists;
                if (status == 'open'){
                    this.managerForm.get('official').setValue(this.listOfficials[0].id_funcionario)
                }
            }
        );
    }

    saveManagers(){
        this.event.managers=this.managers;
        this._loadService.show();
        this._htService.saveManagers(this._route.snapshot.paramMap.get('id'),this.event.id,JSON.stringify(this.managers)).subscribe(
            (resp: any) => {

                if ( resp.error ){
                    this._messageService.add({
                        severity: 'error',
                        summary: 'ADVERTENCIA',
                        detail: resp.message,
                        life: 9000
                    });
                }else{
                    this._closeEventPanel();
                    this._loadService.hide();
                }

        });
    }

    colors(index){
        return Math.floor(Math.random() * this.color_list.length);
    }
}
