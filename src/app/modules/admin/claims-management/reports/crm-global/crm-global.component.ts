import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import * as moment from 'moment';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'erp-crm-global',
  templateUrl: './crm-global.component.html',
  styleUrls: ['./crm-global.component.scss']
})
export class CrmGlobalComponent implements OnInit {

    chartVisitors: ApexOptions;
    /** Estados **/
    chartAnulado: ApexOptions;
    chartArchivoConRespuesta: ApexOptions;
    chartBorrador: ApexOptions;
    chartPendienteAsignacion: ApexOptions;
    chartPendienteRespuesta: ApexOptions;
    chartPendienteRevision: ApexOptions;
    chartRegistradoRipat: ApexOptions;
    chartRespuestaParcial: ApexOptions;
    chartRespuestaRegistradoRipat: ApexOptions;

    chartReclamoVsRespuesta: ApexOptions;

    chartGenero: ApexOptions;

    showAnulado : boolean = false;
    showArchivoConRespuesta : boolean = false;
    showBorrador : boolean = false;
    showPendienteAsignacion : boolean = false;
    showPendienteRespuesta : boolean = false;
    showPendienteRevision : boolean = false;
    showRegistradoRipat : boolean = false;
    showRespuestaParcial : boolean = false;
    showRespuestaRegistradoRipat : boolean = false;

    percentAnulado :number = 0;
    percentArchivoConRespuesta :number = 0;
    percentBorrador :number = 0;
    percentPendienteAsignacion :number = 0;
    percentPendienteRespuesta :number = 0;
    percentPendienteRevision :number = 0;
    percentRegistradoRipat :number = 0;
    percentRespuestaParcial :number = 0;
    percentRespuestaRegistradoRipat :number = 0;
    /** Estados **/

    data: any;

    listaGestion: any [] = [];
    listaPeriodo: any [] = [];
    listaReclamo: any [] = [];
    listaRespuesta: any [] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    FilterForm: FormGroup;
    showDetalle : boolean = false;
    constructor(
        private _router: Router,
        private _reporteS: ReportsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {

        this.FilterForm = this._formBuilder.group({
            gestion: ['',[Validators.required]],
            periodo: [''],

        });

        this.FilterForm.get('gestion').setValue('blank');

        this._reporteS.getGestion( ).subscribe(
            (gestion: any[]) => {
                this.listaGestion = gestion;
            }
        );

        this.data = {
            visitors           : {
                series: {
                    gestion: [
                        {
                            name: 'Reclamos',
                            data: []
                        }
                    ]

                }
            },
            anulado        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            archivo_con_respuesta        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            borrador        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            pendiente_asignacion        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            pendiente_respuesta        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            pendiente_revision        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            registrado_ripat        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            respuesta_parcial        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            respuesta_registrado_ripat        : {
                amount: 0,
                labels: [],
                series: [
                    {
                        name: 'Reclamos',
                        data: []
                    }
                ]
            },
            reclamoVsRespuesta: {
                overallScore  : 0,
                averageRatio  : 0,
                predictedRatio: 0,
                overallScorePercent: 0,
                averageRatioPercent: 0,
                predictedRatioPercent: 0,
                series        : [
                    {
                        name: 'Reclamos',
                        data: []
                    },
                    {
                        name: 'Respuestas',
                        data: []
                    }
                ]
            },
            newVsReturning     : {
                uniqueVisitors: 46085,
                series        : [80, 20],
                labels        : [
                    'New',
                    'Returning'
                ]
            },
            genero             : {
                uniqueVisitors: 0,
                series        : [],
                labels        : [
                    'Varon',
                    'Mujer',
                    'Otros'
                ]
            },
            age                : {
                uniqueVisitors: 46085,
                series        : [35, 65],
                labels        : [
                    'Under 30',
                    'Over 30'
                ]
            },
            language           : {
                uniqueVisitors: 46085,
                series        : [25, 75],
                labels        : [
                    'English',
                    'Other'
                ]
            }
        };

        this._prepareChartData();
    }


    onGestionChange(ev){

        this.FilterForm.get('periodo').reset();

        if (ev.value != 'blank') {

            this.showDetalle = true;
            let gestion = this.listaGestion.find(ges => ges.id_gestion == ev.value);

            /*this._reporteS.getPeriodo(ev.value)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((month: any) => {
                    this.listaPeriodo = month;
                    this._changeDetectorRef.markForCheck();
                });*/
            this._reporteS.getPeriodo(ev.value).subscribe(
                (periodo: any[]) => {
                    this.listaPeriodo = periodo;
                }
            );

            /*this._reporteS.getResumen({fecha_ini:`01/01/${gestion.gestion}`, fecha_fin:`31/12/${gestion.gestion}`}).subscribe(
                (resumen: any[]) => {
                    this.listaReclamo = resumen;
                    this.listaReclamo.forEach(item => {
                        item.x = moment(item.x).toDate()
                    });
                    this.data.visitors.series.gestion[0].data = this.listaReclamo;
                    this._prepareChartData();
                    this._changeDetectorRef.markForCheck();
                }
            );*/

            this._reporteS.getDetalleResumen({fecha_ini:`01/01/${gestion.gestion}`, fecha_fin:`31/12/${gestion.gestion}`}).subscribe(
                (detalle: any) => {
                    /** Datos para la grafica */
                    this.listaReclamo = detalle.reclamo;
                    this.listaRespuesta = detalle.respuesta;


                    this.data.reclamoVsRespuesta.overallScore = detalle.totalrec + detalle.totalres;
                    this.data.reclamoVsRespuesta.averageRatio = detalle.totalrec;
                    this.data.reclamoVsRespuesta.predictedRatio = detalle.totalres;

                    this.data.reclamoVsRespuesta.overallScorePercent = 100;
                    this.data.reclamoVsRespuesta.averageRatioPercent = (detalle.totalrec/(detalle.totalrec+detalle.totalres))*100;
                    this.data.reclamoVsRespuesta.predictedRatioPercent = (detalle.totalres/(detalle.totalrec+detalle.totalres))*100;

                    this.data.visitors.series.gestion[0].data = this.listaReclamo;
                    this.data.genero.series[0] = detalle.generos[0].cantidad;
                    this.data.genero.series[1] = detalle.generos[2]?.cantidad || 0;
                    this.data.genero.series[2] = detalle.generos[1].cantidad + detalle.generos[3]?.cantidad;
                    this.data.genero.uniqueVisitors = detalle.generos[0].cantidad + detalle.generos[2]?.cantidad || 0 + detalle.generos[1].cantidad + detalle.generos[3]?.cantidad || 0;

                    //BEGIN Reclamo Vs Respuesta
                    let commonReclamo = this.listaReclamo.filter(first => {
                        const ok = this.listaRespuesta.find(second => {
                            return first.x == second.x;
                        });
                        if ( ok ) {
                            return ok;
                        }
                    } );
                    this.data.reclamoVsRespuesta.series[0].data = commonReclamo;

                    let commonRespuesta = this.listaRespuesta.filter(first => {
                        const ok = this.listaReclamo.find(second => {
                            return first.x == second.x;
                        });
                        if ( ok ) {
                            return ok;
                        }
                    } );
                    this.data.reclamoVsRespuesta.series[1].data = commonRespuesta;
                    //END Reclamo Vs Respuesta

                    /** Datos para la grafica */

                    /** Anulados */
                    let anulado = detalle.summary.find(item => item.estado == 'anulado');
                    if ( anulado ) {
                        let detail_anulado = detalle.detail.filter(item => item.estado == 'anulado');
                        this.data.anulado.amount = anulado.cantidad;
                        this.data.anulado.labels = detail_anulado.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.anulado.series[0].data = detail_anulado.map(item => item.cantidad);
                        this.showAnulado = true;
                        this.percentAnulado =  Math.ceil((anulado.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showAnulado = false;
                        this.percentAnulado = 0;
                    }
                    /** Archivo con Respuesta */
                    let archivo_con_respuesta = detalle.summary.find(item => item.estado == 'archivo_con_respuesta');
                    if ( archivo_con_respuesta ) {
                        let detail_archivo_con_respuesta = detalle.detail.filter(item => item.estado == 'archivo_con_respuesta');
                        this.data.archivo_con_respuesta.amount = archivo_con_respuesta.cantidad;
                        this.data.archivo_con_respuesta.labels = detail_archivo_con_respuesta.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.archivo_con_respuesta.series[0].data = detail_archivo_con_respuesta.map(item => item.cantidad);
                        this.showArchivoConRespuesta = true;
                        this.percentArchivoConRespuesta =  Math.ceil((archivo_con_respuesta.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showArchivoConRespuesta = false;
                        this.percentArchivoConRespuesta = 0;
                    }
                    /** Borrador */
                    let borrador = detalle.summary.find(item => item.estado == 'borrador');
                    if ( borrador ) {
                        let detail_borrador = detalle.detail.filter(item => item.estado == 'borrador');
                        this.data.borrador.amount = borrador.cantidad;
                        this.data.borrador.labels = detail_borrador.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.borrador.series[0].data = detail_borrador.map(item => item.cantidad);
                        this.showBorrador = true;
                        this.percentBorrador =  Math.ceil((borrador.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showBorrador = false;
                        this.percentBorrador = 0;
                    }

                    /** Pendiente Asignación */
                    let pendiente_asignacion = detalle.summary.find(item => item.estado == 'pendiente_asignacion');
                    if ( pendiente_asignacion ) {
                        let detail_pendiente_asignacion = detalle.detail.filter(item => item.estado == 'pendiente_asignacion');
                        this.data.pendiente_asignacion.amount = pendiente_asignacion.cantidad;
                        this.data.pendiente_asignacion.labels = detail_pendiente_asignacion.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.pendiente_asignacion.series[0].data = detail_pendiente_asignacion.map(item => item.cantidad);
                        this.showPendienteAsignacion = true;
                        this.percentPendienteAsignacion =  Math.ceil((pendiente_asignacion.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showPendienteAsignacion = false;
                        this.percentPendienteAsignacion = 0;
                    }
                    /** Pendiente Respuesta */
                    let pendiente_respuesta = detalle.summary.find(item => item.estado == 'pendiente_respuesta');
                    if ( pendiente_respuesta ) {
                        let detail_pendiente_respuesta = detalle.detail.filter(item => item.estado == 'pendiente_respuesta');
                        this.data.pendiente_respuesta.amount = pendiente_respuesta.cantidad;
                        this.data.pendiente_respuesta.labels = detail_pendiente_respuesta.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.pendiente_respuesta.series[0].data = detail_pendiente_respuesta.map(item => item.cantidad);
                        this.showPendienteRespuesta = true;
                        this.percentPendienteRespuesta =  Math.ceil((pendiente_respuesta.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showPendienteRespuesta = false;
                        this.percentPendienteRespuesta = 0;
                    }
                    /** Pendiente Revisión */
                    let pendiente_revision = detalle.summary.find(item => item.estado == 'pendiente_revision');
                    if ( pendiente_revision ) {
                        let detail_pendiente_revision = detalle.detail.filter(item => item.estado == 'pendiente_revision');
                        this.data.pendiente_revision.amount = pendiente_revision.cantidad;
                        this.data.pendiente_revision.labels = detail_pendiente_revision.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.pendiente_revision.series[0].data = detail_pendiente_revision.map(item => item.cantidad);
                        this.showPendienteRevision = true;
                        this.percentPendienteRevision =  Math.ceil((pendiente_revision.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showPendienteRevision = false;
                        this.percentPendienteRevision = 0;
                    }
                    /** Registrado Ripat */
                    let registrado_ripat = detalle.summary.find(item => item.estado == 'registrado_ripat');
                    if ( registrado_ripat ) {
                        let detail_registrado_ripat = detalle.detail.filter(item => item.estado == 'registrado_ripat');
                        this.data.registrado_ripat.amount = registrado_ripat.cantidad;
                        this.data.registrado_ripat.labels = detail_registrado_ripat.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.registrado_ripat.series[0].data = detail_registrado_ripat.map(item => item.cantidad);
                        this.showRegistradoRipat = true;
                        this.percentRegistradoRipat =  Math.ceil((registrado_ripat.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showRegistradoRipat = false;
                        this.percentRegistradoRipat = 0;
                    }
                    /** Respuesta Parcial */
                    let respuesta_parcial = detalle.summary.find(item => item.estado == 'respuesta_parcial');
                    if ( respuesta_parcial ) {
                        let detail_respuesta_parcial = detalle.detail.filter(item => item.estado == 'respuesta_parcial');
                        this.data.respuesta_parcial.amount = respuesta_parcial.cantidad;
                        this.data.respuesta_parcial.labels = detail_respuesta_parcial.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.respuesta_parcial.series[0].data = detail_respuesta_parcial.map(item => item.cantidad);
                        this.showRespuestaParcial = true;
                        this.percentRespuestaParcial =  Math.ceil((respuesta_parcial.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showRespuestaParcial = false;
                        this.percentRespuestaParcial = 0;
                    }
                    /** Respuesta Registrado Ripat */
                    let respuesta_registrado_ripat = detalle.summary.find(item => item.estado == 'respuesta_registrado_ripat');
                    if ( respuesta_registrado_ripat ) {
                        let detail_respuesta_registrado_ripat = detalle.detail.filter(item => item.estado == 'respuesta_registrado_ripat');
                        this.data.respuesta_registrado_ripat.amount = respuesta_registrado_ripat.cantidad;
                        this.data.respuesta_registrado_ripat.labels = detail_respuesta_registrado_ripat.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                        this.data.respuesta_registrado_ripat.series[0].data = detail_respuesta_registrado_ripat.map(item => item.cantidad);
                        this.showRespuestaRegistradoRipat = true;
                        this.percentRespuestaRegistradoRipat =  Math.ceil((respuesta_registrado_ripat.cantidad * 100)/detalle.totalrec);
                    }else{
                        this.showRespuestaRegistradoRipat = false;
                        this.percentRespuestaRegistradoRipat = 0;
                    }
                    this._prepareChartData();
                    this._changeDetectorRef.markForCheck();
                }
            );
        }else{
            this.showDetalle = false;
            this.data.visitors.series.gestion[0].data = [];
            this._prepareChartData();
            this._changeDetectorRef.markForCheck();
        }
    }

    onPeriodoChange(ev){

        let periodo = this.listaPeriodo.find(per => per.id_periodo == ev);

        /*this._reporteS.getResumen({fecha_ini:periodo.fecha_ini, fecha_fin:periodo.fecha_fin}).subscribe(
            (resumen: any[]) => {
                this.listaReclamo = resumen;
                this.listaReclamo.forEach(item => {
                    item.x = moment(item.x).toDate()
                });
                this.data.visitors.series.gestion[0].data = this.listaReclamo;
                this._prepareChartData();
                this._changeDetectorRef.markForCheck();
            }
        );*/

        this._reporteS.getDetalleResumen({fecha_ini:periodo.fecha_ini, fecha_fin:periodo.fecha_fin}).subscribe(
            (detalle: any) => {

                /** Datos para la grafica */
                this.listaReclamo = detalle.reclamo;
                this.listaRespuesta = detalle.respuesta;

                this.data.reclamoVsRespuesta.overallScore = detalle.totalrec + detalle.totalres;
                this.data.reclamoVsRespuesta.averageRatio = detalle.totalrec;
                this.data.reclamoVsRespuesta.predictedRatio = detalle.totalres;

                this.data.reclamoVsRespuesta.overallScorePercent = 100;
                this.data.reclamoVsRespuesta.averageRatioPercent = (detalle.totalrec/(detalle.totalrec+detalle.totalres))*100;
                this.data.reclamoVsRespuesta.predictedRatioPercent = (detalle.totalres/(detalle.totalrec+detalle.totalres))*100;

                this.data.visitors.series.gestion[0].data = this.listaReclamo;

                this.data.genero.series[0] = detalle.generos[0].cantidad;
                this.data.genero.series[1] = detalle.generos[2]?.cantidad || 0;
                this.data.genero.series[2] = detalle.generos[1].cantidad + detalle.generos[3]?.cantidad || 0;
                this.data.genero.uniqueVisitors = detalle.generos[0].cantidad + detalle.generos[2]?.cantidad || 0 + detalle.generos[1].cantidad + detalle.generos[3]?.cantidad || 0;

                //BEGIN Reclamo Vs Respuesta
                let commonReclamo = this.listaReclamo.filter(first => {
                    const ok = this.listaRespuesta.find(second => {
                        return first.x == second.x;
                    });
                    if ( ok ) {
                        return ok;
                    }
                } );
                this.data.reclamoVsRespuesta.series[0].data = commonReclamo;

                let commonRespuesta = this.listaRespuesta.filter(first => {
                    const ok = this.listaReclamo.find(second => {
                        return first.x == second.x;
                    });
                    if ( ok ) {
                        return ok;
                    }
                } );
                this.data.reclamoVsRespuesta.series[1].data = commonRespuesta;
                //END Reclamo Vs Respuesta
                /** Datos para la grafica */

                /** Anulados */
                let anulado = detalle.summary.find(item => item.estado == 'anulado');
                if ( anulado ) {
                    let detail_anulado = detalle.detail.filter(item => item.estado == 'anulado');
                    this.data.anulado.amount = anulado.cantidad;
                    this.data.anulado.labels = detail_anulado.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.anulado.series[0].data = detail_anulado.map(item => item.cantidad);
                    this.showAnulado = true;
                    this.percentAnulado = Math.ceil((anulado.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showAnulado = false;
                    this.percentAnulado = 0;
                }
                /** Archivo con Respuesta */
                let archivo_con_respuesta = detalle.summary.find(item => item.estado == 'archivo_con_respuesta');
                if ( archivo_con_respuesta ) {
                    let detail_archivo_con_respuesta = detalle.detail.filter(item => item.estado == 'archivo_con_respuesta');
                    this.data.archivo_con_respuesta.amount = archivo_con_respuesta.cantidad;
                    this.data.archivo_con_respuesta.labels = detail_archivo_con_respuesta.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.archivo_con_respuesta.series[0].data = detail_archivo_con_respuesta.map(item => item.cantidad);
                    this.showArchivoConRespuesta = true;
                    this.percentArchivoConRespuesta = Math.ceil((archivo_con_respuesta.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showArchivoConRespuesta = false;
                    this.percentArchivoConRespuesta = 0;
                }
                /** Borrador */
                let borrador = detalle.summary.find(item => item.estado == 'borrador');
                if ( borrador ) {
                    let detail_borrador = detalle.detail.filter(item => item.estado == 'borrador');
                    this.data.borrador.amount = borrador.cantidad;
                    this.data.borrador.labels = detail_borrador.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.borrador.series[0].data = detail_borrador.map(item => item.cantidad);
                    this.showBorrador = true;
                    this.percentBorrador = Math.ceil((borrador.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showBorrador = false;
                    this.percentBorrador = 0;
                }

                /** Pendiente Asignación */
                let pendiente_asignacion = detalle.summary.find(item => item.estado == 'pendiente_asignacion');
                if ( pendiente_asignacion ) {
                    let detail_pendiente_asignacion = detalle.detail.filter(item => item.estado == 'pendiente_asignacion');
                    this.data.pendiente_asignacion.amount = pendiente_asignacion.cantidad;
                    this.data.pendiente_asignacion.labels = detail_pendiente_asignacion.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.pendiente_asignacion.series[0].data = detail_pendiente_asignacion.map(item => item.cantidad);
                    this.showPendienteAsignacion = true;
                    this.percentPendienteAsignacion = Math.ceil((pendiente_asignacion.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showPendienteAsignacion = false;
                    this.percentPendienteAsignacion = 0;
                }
                /** Pendiente Respuesta */
                let pendiente_respuesta = detalle.summary.find(item => item.estado == 'pendiente_respuesta');
                if ( pendiente_respuesta ) {
                    let detail_pendiente_respuesta = detalle.detail.filter(item => item.estado == 'pendiente_respuesta');
                    this.data.pendiente_respuesta.amount = pendiente_respuesta.cantidad;
                    this.data.pendiente_respuesta.labels = detail_pendiente_respuesta.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.pendiente_respuesta.series[0].data = detail_pendiente_respuesta.map(item => item.cantidad);
                    this.showPendienteRespuesta = true;
                    this.percentPendienteRespuesta = Math.ceil((pendiente_respuesta.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showPendienteRespuesta = false;
                    this.percentPendienteRespuesta = 0;
                }
                /** Pendiente Revisión */
                let pendiente_revision = detalle.summary.find(item => item.estado == 'pendiente_revision');
                if ( pendiente_revision ) {
                    let detail_pendiente_revision = detalle.detail.filter(item => item.estado == 'pendiente_revision');
                    this.data.pendiente_revision.amount = pendiente_revision.cantidad;
                    this.data.pendiente_revision.labels = detail_pendiente_revision.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.pendiente_revision.series[0].data = detail_pendiente_revision.map(item => item.cantidad);
                    this.showPendienteRevision = true;
                    this.percentPendienteRevision = Math.ceil((pendiente_revision.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showPendienteRevision = false;
                    this.percentPendienteRevision = 0;
                }
                /** Registrado Ripat */
                let registrado_ripat = detalle.summary.find(item => item.estado == 'registrado_ripat');
                if ( registrado_ripat ) {
                    let detail_registrado_ripat = detalle.detail.filter(item => item.estado == 'registrado_ripat');
                    this.data.registrado_ripat.amount = registrado_ripat.cantidad;
                    this.data.registrado_ripat.labels = detail_registrado_ripat.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.registrado_ripat.series[0].data = detail_registrado_ripat.map(item => item.cantidad);
                    this.showRegistradoRipat = true;
                    this.percentRegistradoRipat = Math.ceil((registrado_ripat.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showRegistradoRipat = false;
                    this.percentRegistradoRipat = 0;
                }
                /** Respuesta Parcial */
                let respuesta_parcial = detalle.summary.find(item => item.estado == 'respuesta_parcial');
                if ( respuesta_parcial ) {
                    let detail_respuesta_parcial = detalle.detail.filter(item => item.estado == 'respuesta_parcial');
                    this.data.respuesta_parcial.amount = respuesta_parcial.cantidad;
                    this.data.respuesta_parcial.labels = detail_respuesta_parcial.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.respuesta_parcial.series[0].data = detail_respuesta_parcial.map(item => item.cantidad);
                    this.showRespuestaParcial = true;
                    this.percentRespuestaParcial = Math.ceil((respuesta_parcial.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showRespuestaParcial = false;
                    this.percentRespuestaParcial = 0;
                }
                /** Respuesta Registrado Ripat */
                let respuesta_registrado_ripat = detalle.summary.find(item => item.estado == 'respuesta_registrado_ripat');
                if ( respuesta_registrado_ripat ) {
                    let detail_respuesta_registrado_ripat = detalle.detail.filter(item => item.estado == 'respuesta_registrado_ripat');
                    this.data.respuesta_registrado_ripat.amount = respuesta_registrado_ripat.cantidad;
                    this.data.respuesta_registrado_ripat.labels = detail_respuesta_registrado_ripat.map(item => moment(item.fecha_reg).format('DD/MM/YYYY'));
                    this.data.respuesta_registrado_ripat.series[0].data = detail_respuesta_registrado_ripat.map(item => item.cantidad);
                    this.showRespuestaRegistradoRipat = true;
                    this.percentRespuestaRegistradoRipat = Math.ceil((respuesta_registrado_ripat.cantidad * 100)/detalle.totalrec);
                }else{
                    this.showRespuestaRegistradoRipat = false;
                    this.percentRespuestaRegistradoRipat = 0;
                }

                this._prepareChartData();
                this._changeDetectorRef.markForCheck();

            }
        );
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Visitors
        this.chartVisitors = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                width: '100%',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#312E81']
            },
            grid: {
                show: true,
                borderColor: '#334155',
                padding: {
                    top: 10,
                    bottom: -40,
                    left: 0,
                    right: 0
                },
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            series: this.data.visitors.series,
            stroke: {
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'dd/MM/yyyy'
                },
                y: {
                    formatter: (value: number): string => `${value}`
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color: '#475569',
                        dashArray: 0,
                        width: 2
                    }
                },
                labels: {
                    offsetY: -20,
                    style: {
                        colors: '#CBD5E1'
                    }
                },
                tickAmount: 20,
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                min: (min): number => min - 750,
                max: (max): number => max + 250,
                tickAmount: 5,
                show: false
            }
        };

        // Anulado
        this.chartAnulado = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#38BDF8'],
            fill   : {
                colors : ['#38BDF8'],
                opacity: 0.5
            },
            series : this.data.anulado.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.anulado.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Archivo con Respuesta
        this.chartArchivoConRespuesta = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#38BDF8'],
            fill   : {
                colors : ['#38BDF8'],
                opacity: 0.5
            },
            series : this.data.archivo_con_respuesta.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.archivo_con_respuesta.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Borrador
        this.chartBorrador = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#38BDF8'],
            fill   : {
                colors : ['#38BDF8'],
                opacity: 0.5
            },
            series : this.data.borrador.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.borrador.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Pendiente Asignación
        this.chartPendienteAsignacion = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#34D399'],
            fill   : {
                colors : ['#34D399'],
                opacity: 0.5
            },
            series : this.data.pendiente_asignacion.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.pendiente_asignacion.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Pendiente Respuesta
        this.chartPendienteRespuesta = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#34D399'],
            fill   : {
                colors : ['#34D399'],
                opacity: 0.5
            },
            series : this.data.pendiente_respuesta.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.pendiente_respuesta.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Pendiente Revisión
        this.chartPendienteRevision = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#34D399'],
            fill   : {
                colors : ['#34D399'],
                opacity: 0.5
            },
            series : this.data.pendiente_revision.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.pendiente_revision.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Registrado Ripat
        this.chartRegistradoRipat = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#FB7185'],
            fill   : {
                colors : ['#FB7185'],
                opacity: 0.5
            },
            series : this.data.registrado_ripat.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.registrado_ripat.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Respuesta Parcial
        this.chartRespuestaParcial = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#FB7185'],
            fill   : {
                colors : ['#FB7185'],
                opacity: 0.5
            },
            series : this.data.respuesta_parcial.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.respuesta_parcial.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Respuesta Registrado Ripat
        this.chartRespuestaRegistradoRipat = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#FB7185'],
            fill   : {
                colors : ['#FB7185'],
                opacity: 0.5
            },
            series : this.data.respuesta_registrado_ripat.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                categories: this.data.respuesta_registrado_ripat.labels
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => val.toString()
                }
            }
        };

        // Visitors vs Page Views
        this.chartReclamoVsRespuesta = {
            chart     : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                toolbar   : {
                    show: false
                },
                zoom      : {
                    enabled: false
                }
            },
            colors    : ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: false
            },
            fill      : {
                colors : ['#64748B', '#94A3B8'],
                opacity: 0.5
            },
            grid      : {
                show   : false,
                padding: {
                    bottom: -40,
                    left  : 0,
                    right : 0
                }
            },
            legend    : {
                show: false
            },
            series    : this.data.reclamoVsRespuesta.series,
            stroke    : {
                curve: 'smooth',
                width: 2
            },
            tooltip   : {
                followCursor: true,
                theme       : 'dark',
                x           : {
                    format: 'dd/MM/yyyy'
                }
            },
            xaxis     : {
                axisBorder: {
                    show: false
                },
                labels    : {
                    offsetY: -20,
                    rotate : 0,
                    style  : {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tickAmount: 3,
                tooltip   : {
                    enabled: false
                },
                type      : 'datetime'
            },
            yaxis     : {
                labels    : {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                max       : (max): number => max + 250,
                min       : (min): number => min - 250,
                show      : false,
                tickAmount: 5
            }
        };

        // Genero
        this.chartGenero = {
            chart      : {
                animations: {
                    speed           : 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'donut',
                sparkline : {
                    enabled: true
                }
            },
            colors     : ['#319795', '#805AD5', '#DD6B20'],
            labels     : this.data.genero.labels,
            plotOptions: {
                pie: {
                    customScale  : 0.9,
                    expandOnClick: false,
                    donut        : {
                        size: '70%'
                    }
                }
            },
            series     : this.data.genero.series,
            states     : {
                hover : {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip    : {
                enabled        : true,
                fillSeriesColor: false,
                theme          : 'dark',
                custom         : ({
                                      seriesIndex,
                                      w
                                  }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`
            }
        };


        this._changeDetectorRef.markForCheck();
    }

}
