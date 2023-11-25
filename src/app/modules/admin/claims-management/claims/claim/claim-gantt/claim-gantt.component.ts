import {ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ClaimGanttService } from './claim-gantt.service';
import {FormBuilder, FormGroup} from "@angular/forms";
import {BobyConfirmationService} from "@boby/services/confirmation";
import {BobyLoadingService} from "@boby/services/loading";
import {MatDialog} from "@angular/material/dialog";
import {ClaimGanttDocumentComponent} from "./claim-gantt-document/claim-gantt-document.component";

@Component({
  selector: 'erp-claim-gantt',
  templateUrl: './claim-gantt.component.html',
  styleUrls: ['./claim-gantt.component.scss']
})
export class ClaimGanttComponent implements OnInit {

    @HostListener ('window:scroll')
    onWindowScroll(): void{
        const yOffset = window.scrollY;
        const scrollTop = this.document.documentElement.scrollTop;
        this.showButton = (yOffset || scrollTop) > this.scrollHeight;
    }

    @Input() reclamo: any;
    @Input() officialRoles: any;
    public linesToWrite: Array<string>;
    private finishPage = 5;
    private actualPage: number;

    public page = 0;
    public processes: any[] = [];
    public showButton = false;
    private scrollHeight = 300;

    forceTooltips: any = false;
    fixed: any = false;
    open: any = false;

    private configForm: FormGroup;
    private imageSrc:any = '';
    public viewer_file: string ='url';
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private _ganttS:ClaimGanttService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService,
        private _loadService: BobyLoadingService,
        private _matDialog: MatDialog
    ) { }

    ngOnInit(): void {
        /*this.actualPage = 1;
        this.linesToWrite = new Array<string>();
        this.add40lines();*/

        this._ganttS.getProcessByPage(this.page, this.reclamo.id_proceso_wf) .subscribe(
            (processes) => {
                this.processes = processes;
                this.page += 5;
                this._changeDetectorRef.markForCheck();
        });
    }

    add40lines() {
        const line = 'Another new line -- ';
        let lineCounter = this.linesToWrite.length;
        for (let i = 0; i < 40; i ++) {
            this.linesToWrite.push(line + lineCounter);
            lineCounter ++;
        }
    }

    onScrollTop(): void {
        this.document.documentElement.scrollTop = 0;
    }

    onScrollDown(): void{

        this._ganttS.getProcessByPage(this.page, this.reclamo.id_proceso_wf).subscribe(
            (processes) => {
                this.processes = [...this.processes, ...processes];
                this._changeDetectorRef.markForCheck();
        });

        this.page += 5;

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


    uploadMediaFile(){ }
    uploadDocument(){ }

    /**
     * Upload file
     */
    onUploadFile(fileList: FileList, proc: any): void
    {
        // Return if canceled
        if ( !fileList.length )
        {
            return;
        }

        const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','audio/mpeg','audio/midi','audio/x-midi','audio/x-wav','video/mp4','video/mpeg','video/webm','video/x-msvideo','image/png','image/jpeg','image/jpg','image/gif','image/webp'];
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
        this._loadService.show();
        reader.onload = () => {
            this._loadService.hide();
            this.imageSrc = reader.result;
            this._ganttS.onUploadFile(proc.id_estado_wf, file, this.imageSrc).subscribe(
                (response)=>{
                    this.processes.forEach((value, index) =>{
                        if (value.id_estado_wf == proc.id_estado_wf) {

                            const json_file_state = JSON.parse(value.json_file_state);

                            json_file_state.push(JSON.parse(response.file));

                            value.json_file_state = JSON.stringify(json_file_state);

                        }
                    });
                    this._changeDetectorRef.markForCheck();
                }
            );
        };
    }

    parseJson(str: string): any {
        return JSON.parse(str);
    }

    /**
     * file action
     */
    fileAction(action: string, file:any): void
    {
        if (file?.file_name) {
            this.viewer_file = 'url';
            file.viewer_file = this.viewer_file;
            const dialogRef = this._matDialog.open(ClaimGanttDocumentComponent, {
                data: file
            });

            dialogRef.afterClosed()
                .subscribe((result) => {

                });
        }
    }
}
