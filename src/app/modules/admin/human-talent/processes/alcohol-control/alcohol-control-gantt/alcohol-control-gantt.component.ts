import {ChangeDetectorRef, Component, HostListener, Inject, Input, OnInit} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {ClaimGanttService} from "../../../../claims-management/claims/claim/claim-gantt/claim-gantt.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'erp-alcohol-control-gantt',
  templateUrl: './alcohol-control-gantt.component.html',
  styleUrls: ['./alcohol-control-gantt.component.scss']
})
export class AlcoholControlGanttComponent implements OnInit {

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
    constructor(
        @Inject(DOCUMENT) private document: Document,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _ganttS:ClaimGanttService,
        private _changeDetectorRef: ChangeDetectorRef,
        public matDialogRef: MatDialogRef<AlcoholControlGanttComponent>
    ) { }

    ngOnInit(): void {

        this._ganttS.getProcessByPage(this.page, this._data.selectedLottery.id_proceso_wf) .subscribe(
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

    /**
     * Close dialog
     */
    Close(): void
    {
        // Close the dialog
        this.matDialogRef.close();
    }

}
