import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    AfterViewInit,
    ViewChild,
    ViewEncapsulation,
    QueryList,
    ViewChildren
} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { takeUntil, Subject, merge, switchMap, map, Observable, debounceTime } from 'rxjs';
import { ClaimFilesService } from "./claim-files.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";

import {BobyConfirmationService} from "@boby/services/confirmation";
import { UploadFileComponent } from "./upload-file/upload-file.component";

//import { PreviewComponent } from "../preview/preview.component";

import { FileDetailComponent } from "./file-detail/file-detail.component";

import { BobyScrollbarDirective } from '@boby/directives/scrollbar/scrollbar.directive';


@Component({
    selector: 'erp-claim-files',
    templateUrl: './claim-files.component.html',
    styleUrls: ['./claim-files.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimFilesComponent implements OnInit {

    /*@ViewChildren(BobyScrollbarDirective)
    private _bobyScrollbarDirectives: QueryList<BobyScrollbarDirective>*/

    @Input() reclamo: any;
    @Input() officialRoles: any;
    selectedFile: any[] = [];

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    pagination: any = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    archivos$: Observable<any[]>;
    searchInputControl: FormControl = new FormControl();

    dataSource: MatTableDataSource<any>;


    private imageSrc:any = '';
    private configForm: FormGroup;

    public disabled:boolean = true;

    displayedColumns = [
        'icono','accion', 'nombre_tipo_documento', 'descripcion_proceso_wf', 'nro_tramite_ori'
    ];

    cols = [
        { field: 'nombre_tipo_documento', header: 'Nombre Doc.', width: 'min-w-96'},
        { field: 'descripcion_proceso_wf', header: 'Desc.Proceso', width: 'min-w-60'},
        { field: 'nro_tramite_ori', header: 'Doc. Previos', width: 'min-w-40'}
    ];

    public viewer_file: string ='url';

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _matDialog: MatDialog,
        private _archivoS: ClaimFilesService,
        private _fcService: BobyConfirmationService,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {

        this._archivoS.getArchivos(0,100,'nombre_tipo_documento','asc', '', this.reclamo).subscribe(
            (resp) => {
                //this.archivos$ = this._archivoS.archivos$;


                this.dataSource = new MatTableDataSource(resp.documentos);
                this._paginator._intl.itemsPerPageLabel="Registros por pagina";
                this._paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 de ${length }`;
                    }
                    length = Math.max(length, 0);
                    const startIndex = page * pageSize;
                    // If the start index exceeds the list length, do not try and fix the end index to the end.
                    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
                    return `${startIndex + 1} - ${endIndex} de ${length}`;
                };
                this._paginator._intl.nextPageLabel = 'Página Siguiente';
                this._paginator._intl.firstPageLabel = 'Primera Página';
                this._paginator._intl.lastPageLabel = 'Ultima Página';
                this._paginator._intl.previousPageLabel = 'Página Anterior';
                this.pagination = resp.pagination;
                this.dataSource.paginator = this._paginator;
                this.dataSource.sort = this._sort;

                this._paginator.page.subscribe(
                    (event) => {
                    }
                );

            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._archivoS.getArchivos(0, 10, 'name', 'asc', query, this.reclamo);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    refreshFiles(){
        this._archivoS.getArchivos(0,5,'nombre_tipo_documento','asc', '', this.reclamo).subscribe(
            (resp) => {
                this.dataSource = new MatTableDataSource(resp.documentos);

                this.pagination = resp.pagination;
                this.dataSource.paginator = this._paginator;
                this.dataSource.sort = this._sort;
                this._changeDetectorRef.markForCheck();
            }
        );
    }

    executeCommand(valor: string){
        switch (valor) {
            case 'editar':
                //this.showEditOfficeDialog(this.selectedOficina);
                break;
            case 'eliminar':
                //this.deleteOficina(this.selectedOficina);
                break;
            case 'exportar':
                break;
        }
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

    }

    detalleFile(file)
    {
        const dialogRef = this._matDialog.open(FileDetailComponent,{
            data: {
                file :file
            }
        });

        dialogRef.afterClosed()
            .subscribe((result) => {

            });
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
     * create File
     */
    createArchivo(): void
    {

    }


    /**
     * Action archivo
     */
    actionArchivo(modo: string, documento:any): void
    {
        switch (modo) {
            case 'imprimir':
                /*if (documento.codigo_tipo_documento == 'REPS'){
                    this.viewer_file = 'office';
                }else{*/
                this.viewer_file = 'url';
                //}
                documento.viewer_file = this.viewer_file;
                if (documento.tipo_documento !== 'generado') {
                    const dialogRef = this._matDialog.open(UploadFileComponent, {
                        data: documento/*,
                        panelClass: 'fullscreen-dialog',
                        height: '100vh',
                        width: '100%'*/
                    });

                    dialogRef.afterClosed()
                        .subscribe((result) => {

                        });
                }else{
                    this._archivoS.downloadArchivo(documento.id_proceso_wf, documento.action)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            const detalle = response.detail;
                            documento.archivo_generado = detalle.message;
                            documento.viewer_file = this.viewer_file;
                            //window.open(`http://10.150.0.91/kerp/reportes_generados/${detalle.archivo_generado}`, '_blank');
                            const dialogRef = this._matDialog.open(UploadFileComponent, {
                                data: documento/*,
                                panelClass: 'fullscreen-dialog',
                                height: '100vh',
                                width: '100%'*/
                            });

                            dialogRef.afterClosed()
                                .subscribe((result) => {

                                });
                        });
                }

                break;
            case 'subir':

                break;
            case 'ver':

                break;
            case 'eliminar':

                break;
            default:
                alert('default');
        }
    }

    /**
     * Upload archivo
     */
    onShowArchivo(): void
    {
        const dialogRef = this._fcService.open(this.configForm.value);

        dialogRef.afterClosed().subscribe((result) => {

        });
    }

    /**
     * Upload archivo
     */
    onUploadArchivo(fileList: FileList, documento: any): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const file = fileList[0];

        // Return if the file is not allowed
        if ( !allowedTypes.includes(file.type) )
        {

            this.configForm = this._formBuilder.group({
                title: 'Alerta',
                message: `<p class="font-bold">Estimado Usuario:<br> El formato ${file.type} no esta permitido.</p>`,
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
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.imageSrc = reader.result;

            this._archivoS.onUploadArchivo(documento.id_proceso_wf,documento.id_documento_wf, file, this.imageSrc).subscribe(
                (response)=>{
                    this.refreshFiles();
                }
            );
        };

    }

}
