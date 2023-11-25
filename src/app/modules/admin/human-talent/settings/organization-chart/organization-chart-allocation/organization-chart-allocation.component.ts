import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'erp-organization-chart-allocation',
  templateUrl: './organization-chart-allocation.component.html'
})
export class OrganizationChartAllocationComponent implements OnInit {

    @Input() orgaChart: any;

    constructor() { }

    ngOnInit(): void {
    }

}
