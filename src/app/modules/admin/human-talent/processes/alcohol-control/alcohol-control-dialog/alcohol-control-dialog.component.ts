import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import { ClaimsService } from '../../../../claims-management/claims/claims.service';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { HumanTalentService } from '../../../human-talent.service';
import { BobyConfirmationService } from '@boby/services/confirmation';
import {MessageService} from "primeng/api";
import { BobyMockApiUtils } from '@boby/lib/mock-api';
import {BobyLoadingService} from "../../../../../../../@boby/services/loading";

@Component({
    selector: 'erp-alcohol-control-dialog',
    templateUrl: './alcohol-control-dialog.component.html',
    styleUrls: ['./alcohol-control-dialog.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlcoholControlDialogComponent implements OnInit {

    public ControlForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    public listDays: any = [
        {value:'monday', name: 'Lunes', percent:30, number:1},
        {value:'tuesday', name: 'Martes', percent:2, number:2},
        {value:'wednesday', name: 'Miercoles', percent:2, number:3},
        {value:'thursday', name: 'Jueves', percent:30, number:4},
        {value:'friday', name: 'Viernes', percent:30, number:5},
        {value:'saturday', name: 'Sabado', percent:2, number:6},
        {value:'sunday', name: 'Domingo', percent:2, number:7},
        {value:'holiday', name: 'Feriado', percent:2, number:8}
    ];

    public listOfficials: any;
    private daysOfMonth = new Map<number, Date>();
    private chosenDays = new Map<number, Date>();
    private lotteryOfDays:any[] = [];
    private configForm: FormGroup;

    weeks: any[] = [];

    public listPeriods: any;

    public overallPercentage: number = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        public matDialogRef: MatDialogRef<AlcoholControlDialogComponent>,
        private _claimService: ClaimsService,
        private _htService: HumanTalentService,
        private _fcService: BobyConfirmationService,
        private _loadService: BobyLoadingService
    ) { }

    ngOnInit(): void {
        this.ControlForm = this._formBuilder.group({
            /*daysAndPercents:this._formBuilder.array([
                this._formBuilder.group({
                    percent : [''],
                    day : ['']
                })
            ]),*/
            daysAndPercents : this._formBuilder.array([]),
            official: ['', Validators.required],
            generationDate: ['', Validators.required],
            startRange: ['', Validators.required],
            endRange: ['', Validators.required],
            weekDays: [8, [Validators.required,Validators.min,Validators.max,Validators.pattern(/^[0-9]\d*$/)]],
            weekEndDays: [2, [Validators.required,Validators.min,Validators.max,Validators.pattern(/^[0-9]\d*$/)]]
        });

        this.generateDayAndPercent();

        const dataUser = JSON.parse(localStorage.getItem('aut')).nombre_usuario;

        this.searchOfficial(dataUser, 'open');

        this._htService.getPeriod().subscribe(
            (response) => {
                this.listPeriods = response.datos;
            }
        );

    }

    valueChange(event){

        this.overallPercentage = this.ControlForm.get('daysAndPercents').value.reduce((accumulator, item) => accumulator+item.percent, 0);

        if ( this.overallPercentage > 100 ) {

            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'ADVERTENCIA',
                message: `Estimado Usuario, el porcentaje actual es ${this.overallPercentage} % no es posible superar el 100% !!`,
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

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {


                }
            });

            this._changeDetectorRef.markForCheck();
        }
    }

    generateDayAndPercent(){
        for( let elem of this.listDays ){
            const dayAndPercentFormGroup = this._formBuilder.group({
                day: ['', [Validators.required]],
                percent: [elem.percent, [Validators.pattern(/^[0-9]\d*$/)]]
            });
            dayAndPercentFormGroup.get('day').setValue(elem.value);
            (this.ControlForm.get('daysAndPercents') as FormArray).push(dayAndPercentFormGroup);
        }
        this.overallPercentage = this.ControlForm.get('daysAndPercents').value.reduce((accumulator, item) => accumulator+item.percent, 0);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * close Dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

    selectGenerateDate(date){
        const period = this.listPeriods.find(item => item.literal === date.value)
        //const nextMonth = date.getMonth() + 1;
        // Get year
        //const year = date.getFullYear() + (nextMonth === 12 ? 1: 0);
        // Get first day of the next month
        let firstDayOfNextMonth = new Date(period.fecha_ini);//new Date(year, nextMonth%12, 1);
        firstDayOfNextMonth.setDate(firstDayOfNextMonth.getDate() + 1);//new Date(year, nextMonth%12, 1);
        // Get last day of the next month
        let lastDayOfNextMonth =  new Date(period.fecha_fin);//new Date(firstDayOfNextMonth.getFullYear(), firstDayOfNextMonth.getMonth()+1, 0);;
        lastDayOfNextMonth.setDate(lastDayOfNextMonth.getDate() + 1);//new Date(firstDayOfNextMonth.getFullYear(), firstDayOfNextMonth.getMonth()+1, 0);;
        this.ControlForm.get('startRange').setValue(firstDayOfNextMonth);
        this.ControlForm.get('endRange').setValue(lastDayOfNextMonth);
    }

    generateLotteryOfDays (){

        this.weeks = [];
        const daysAndPercents = (this.ControlForm.get('daysAndPercents') as FormArray);
        const percent = 100 / daysAndPercents.length;
        const last = this.ControlForm.get('endRange').value;
        var totalDays = last.getDate();
        let weekOfMonth = Math.ceil(totalDays / 7);
        const weeksInMonth = this.getWeeksInMonth();
        const weekDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        let daysWeek = [];
        this.daysOfMonth = new Map<number, Date>();
        for (let day = 1; day <= totalDays; day++) {
            this.daysOfMonth.set( day, new Date(last.getFullYear(), last.getMonth(), day) );
            //daysWeek.push(new Date(last.getFullYear(), last.getMonth(), day));
        }
        let weekDays = this.ControlForm.get('weekDays').value;
        let weekEndDays = this.ControlForm.get('weekEndDays').value;

        //let chosenDays = [];
        this.chosenDays = new Map<number, Date>();
        const totDays = this.ControlForm.get('weekDays').value+this.ControlForm.get('weekEndDays').value;
        for (let tday = 1; tday <= totDays;) {

            //let chosenDate = daysWeek[Math.floor(Math.random() * daysWeek.length)];
            const indexDate = Math.floor(Math.random() * this.daysOfMonth.size + 1);
            let chosenDate = this.daysOfMonth.get(indexDate);

            if ( ! this.chosenDays.has(indexDate)/*chosenDays.includes( chosenDate )*/ ) {
                if ( ['saturday','sunday','holiday'].includes( weekDayNames[chosenDate.getDay()]) ) {
                    if ( weekEndDays > 0 ) {
                        weekEndDays--;
                        //chosenDays.push(chosenDate);
                        this.chosenDays.set(indexDate, chosenDate);
                        tday++;
                    }
                }else {
                    if (weekDays > 0) {
                        weekDays--;
                        //chosenDays.push(chosenDate);
                        this.chosenDays.set(indexDate, chosenDate);
                        tday++;
                    }
                }
            }
        }

        let day = 1;
        let firstDay = this.ControlForm.get('startRange').value;
        const year = firstDay.getFullYear();
        const month = firstDay.getMonth();

        weekOfMonth = this.weeksCount(year, month+1);
        for ( let week = 0; week < weekOfMonth; ++week ) {

            this.weeks.push([{}, {}, {}, {}, {}, {}, {}]);

            let less = [];
            let selectedDays = [];
            daysAndPercents.value.forEach(item => {
                if (item.percent > percent)
                    selectedDays = [...selectedDays, item];
                else
                    less = [...less, item];
            });
            selectedDays = [...selectedDays, less[Math.floor(Math.random() * less.length)]];

            //const selectedOrganizationChart = this._data.selectedUnits[Math.floor(Math.random() * this._data.selectedUnits.length)];
            //const weekDayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            let daysPerWeek = [];

            /************************** ************************/
            let firstDayOfTheMonth = firstDay.getDay();
            let weekDay = week === 0 ? firstDayOfTheMonth : 0;
            for (; weekDay < weekDayNames.length; ++weekDay) {

                const currentDate = new Date(year, month, day);
                //const currentDate = this.daysOfMonth.get(weekDay);
                const selectedDay = selectedDays.find(selDay => selDay.day == weekDayNames[currentDate.getDay()]);

                const selectedOrganizationChart = this._data.selectedUnits[Math.floor(Math.random() * this._data.selectedUnits.length)];
                if ( /*selectedDay &&*/ this.chosenDays.has(day) ) {
                    this.weeks[week][weekDay] = {
                        id: BobyMockApiUtils.guid(),
                        date: moment/*.utc*/(currentDate).format('DD/MM/YYYY'),
                        day,
                        weekDay: weekDayNames[weekDay],
                        schedules: [{
                            id: BobyMockApiUtils.guid(),
                            id_uo: selectedOrganizationChart.id_uo,
                            name: selectedOrganizationChart.nombre_unidad
                        }]
                    };
                }else{
                    this.weeks[week][weekDay] = {
                        id: BobyMockApiUtils.guid(),
                        date: moment/*.utc*/(currentDate).format('DD/MM/YYYY'),
                        day,
                        weekDay: weekDayNames[weekDay],
                        schedules: []
                    };
                }

                ++day;
                if (new Date(year, month, day).getMonth() !== month) {
                    return;
                }
            }
            /************************** ************************/

            /*weeksInMonth[week].dates.forEach(day => {
                const selectedOrganizationChart = this._data.selectedUnits[Math.floor(Math.random() * this._data.selectedUnits.length)];

                const selectedDay = selectedDays.find(selDay => selDay.day == weekDays[this.daysOfMonth.get(day).getDay()]);
                if (selectedDay) {
                    //this.lotteryOfDays.push({week: week+1, dateLottery:moment.utc(this.daysOfMonth.get(day)).format('DD/MM/YYYY'),unitLottery:selectedOrganizationChart});

                    daysPerWeek.push({
                        id: BobyMockApiUtils.guid(),
                        name:moment.utc(this.daysOfMonth.get(day)).format('DD/MM/YYYY'),//dateLottery:moment.utc(this.daysOfMonth.get(day)).format('DD/MM/YYYY'),
                        children:[{id: BobyMockApiUtils.guid(), id_uo: selectedOrganizationChart.id_uo, name: selectedOrganizationChart.nombre_unidad, children: []}]//unitLottery:[selectedOrganizationChart]
                    });

                }else{

                }
            });*/

            /*this.lotteryOfDays.push({
                id: BobyMockApiUtils.guid(),
                name: `SEMANA ${week+1}`,//week: `SEMANA ${week+1}`,
                children:daysPerWeek
            });*/

        }

    }

    getWeeksInMonth() {
        const weeks = [],
            firstDate = this.ControlForm.get('startRange').value,
            lastDate = this.ControlForm.get('endRange').value,
            numDays = lastDate.getDate();

        let dayOfWeekCounter = firstDate.getDay()-1;

        for (let date = 1; date <= numDays; date++) {
            if (dayOfWeekCounter === 0 || weeks.length === 0) {
                weeks.push([]);
            }
            weeks[weeks.length - 1].push(date);
            dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
        }

        return weeks
            .filter((w) => !!w.length)
            .map((w) => ({
                start: w[0],
                end: w[w.length - 1],
                dates: w,
            }));
    }

    generateLottery(): void{

        // Build the config form
        this.configForm = this._formBuilder.group({
            title: 'Alerta',
            message: `Estimado Usuario, esta seguro de generar el Sorteo?`,
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

                this.lotteryOfDays = [];
                this.generateLotteryOfDays();

                const lottery = this.ControlForm.getRawValue();
                Object.keys(lottery).forEach(key => {
                    if (!lottery[key]) {
                        lottery[key] = '';
                    }

                    if (['startRange', 'endRange'].includes(key)) {
                        lottery[key] = moment(lottery[key]).format('DD/MM/YYYY');
                    }
                });

                this.ControlForm.disable();
                this._loadService.show();
                this._htService.generateLottery(JSON.stringify(lottery), JSON.stringify(this.weeks))
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response) => {
                        this._loadService.hide();
                        this.matDialogRef.close(response);
                    });

            }
        });
    }

    weeksCount = function(year, month): number {
        let firstOfMonth = new Date(year, month - 1, 1);
         let day = firstOfMonth.getDay() || 6;
        day = day === 1 ? 0 : day;
        if (day) { day-- }
         let diff = 7 - day;
         let lastOfMonth = new Date(year, month, 0);
         let lastDate = lastOfMonth.getDate();
        if (lastOfMonth.getDay() === 1) {
            diff--;
        }
         let result = Math.ceil((lastDate - diff) / 7);
        return result + 1;
    };

    addDayAndPercentField(): void{

        this.overallPercentage = this.ControlForm.get('daysAndPercents').value.reduce((accumulator, item) => accumulator+item.percent, 0);

        if ( this.overallPercentage < 100 ) {
            const dayAndPercentFormGroup = this._formBuilder.group({
                day: ['', [Validators.required]],
                percent: ['', [Validators.pattern(/^[0-9]\d*$/)]]
            });

            (this.ControlForm.get('daysAndPercents') as FormArray).push(dayAndPercentFormGroup);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }else{
            // Build the config form
            this.configForm = this._formBuilder.group({
                title: 'ADVERTENCIA',
                message: `Estimado Usuario, el porcentaje actual es ${this.overallPercentage} % no es posible agregar mas dias !!`,
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

            // Subscribe to afterClosed from the dialog reference
            dialogRef.afterClosed().subscribe((result) => {
                if (result == 'confirmed') {


                }
            });
        }
    }

    /**
     * Remove the day and percent field
     *
     * @param index
     */
    removeDayAndPercentField(index: number): void
    {
        const daysAndPercentsFormArray = this.ControlForm.get('daysAndPercents') as FormArray;
        daysAndPercentsFormArray.removeAt(index);

        this.overallPercentage = this.ControlForm.get('daysAndPercents').value.reduce((accumulator, item) => accumulator+item.percent, 0);
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
     * load Funcionario
     */
    searchOfficial(query: string, status: string): void
    {
        this._claimService.searchFuncionario(query).subscribe(
            (lists) => {
                this.listOfficials = lists;
                if (status == 'open'){
                    this.ControlForm.get('official').setValue(this.listOfficials[0].id_funcionario)
                }
            }
        );
    }

    /**
     * Get Nombre Funcionario Recepcion
     */
    getFuncRecepcion(id_funcionario: string) {
        if (id_funcionario !== null && id_funcionario !== undefined && id_funcionario !== '')
            return this.listOfficials.find(funcionario => funcionario.id_funcionario === id_funcionario).desc_funcionario2;
    }
}
