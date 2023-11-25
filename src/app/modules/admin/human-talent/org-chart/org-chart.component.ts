import {
    OnChanges,
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef
} from "@angular/core";
import {TreeNode} from 'primeng/api';
import {MessageService} from 'primeng/api';
import {HumanTalentService} from "../human-talent.service";
/*import { TreeChart } from "d3-org-chart";
import { OrgChart } from 'd3-org-chart';
import * as d3 from 'd3';*/

@Component({
  selector: 'lan-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
})
export class OrgChartComponent implements OnInit {

    /*@ViewChild("chartContainer") chartContainer: ElementRef;
    @Input() data: any[];
    chart;
    dataOrg: any[];*/


    data: TreeNode[];
    orga: TreeNode[];

    selectedNode: TreeNode;
    loading: boolean;

    constructor(private messageService: MessageService, private _htService: HumanTalentService) {}

    ngOnInit() {

        this.loading = true;

        /*this._htService.getOrganizationData(0).subscribe((resp)=>{

            this.orga = [];
            for(let i = 0; i < resp.length; i++) {
                let node = {
                    data: resp[i],
                    leaf: false
                };
                this.orga.push(node);
            }

            this.loading = false;
        });*/

        this.data = [{
            label: 'CEO',
            type: 'person',
            styleClass: 'p-person',
            expanded: true,
            data: {name:'Walter White', 'avatar': 'walter.jpg'},
            children: [
                {
                    label: 'CFO',
                    type: 'person',
                    styleClass: 'p-person',
                    expanded: true,
                    data: {name:'Saul Goodman', 'avatar': 'saul.jpg'},
                    children:[{
                        label: 'Tax',
                        styleClass: 'department-cfo'
                    },
                        {
                            label: 'Legal',
                            styleClass: 'department-cfo'
                        }],
                },
                {
                    label: 'COO',
                    type: 'person',
                    styleClass: 'p-person',
                    expanded: true,
                    data: {name:'Mike E.', 'avatar': 'mike.jpg'},
                    children:[{
                        label: 'Operations',
                        styleClass: 'department-coo'
                    }]
                },
                {
                    label: 'CTO',
                    type: 'person',
                    styleClass: 'p-person',
                    expanded: true,
                    data: {name:'Jesse Pinkman', 'avatar': 'jesse.jpg'},
                    children:[{
                        label: 'Development',
                        styleClass: 'department-cto',
                        expanded: true,
                        children:[{
                            label: 'Analysis',
                            styleClass: 'department-cto'
                        },
                            {
                                label: 'Front End',
                                styleClass: 'department-cto'
                            },
                            {
                                label: 'Back End',
                                styleClass: 'department-cto'
                            }]
                    },
                        {
                            label: 'QA',
                            styleClass: 'department-cto'
                        },
                        {
                            label: 'R&D',
                            styleClass: 'department-cto'
                        }]
                }
            ]
        }];

    }

    onNodeSelect(event) {
        this.messageService.add({severity: 'success', summary: 'Node Selected', detail: event.node.label});
    }
    /*ngOnInit(): void {

        this.dataOrg = [
            {
                nodeId: "O-1",
                parentNodeId: null,
                template:
                    '<div>\n' +
                    '  <div style="margin-left:70px; margin-top:10px; font-size:20px; font-weight:bold;">Ian Devling </div>               \n' +
                    '    <div style="margin-left:70px;margin-top:3px;font-size:16px;">Cheaf Executive Officer</div>                 \n' +
                    '    <div style="margin-left:70px;margin-top:3px;font-size:14px;">Business first</div>                 \n' +
                    '    <div style="margin-left:196px;margin-top:15px;font-size:13px;position:absolute;bottom:5px;">                    \n' +
                    '    <div>CTO office</div>                      \n' +
                    '    <div style="margin-top:5px">Corporate</div>                \n' +
                    '  </div>             \n' +
                    '</div>',
                totalSubordinates: 1
            },
            {
                nodeId: "O-2",
                parentNodeId: "O-1",
                template: "<div>\n                  <div style=\"margin-left:70px;\n                              margin-top:10px;\n                              font-size:20px;\n                              font-weight:bold;\n                         \">Davolio Nancy </div>\n                 <div style=\"margin-left:70px;\n                              margin-top:3px;\n                              font-size:16px;\n                         \">CTO  </div>\n\n                 <div style=\"margin-left:70px;\n                              margin-top:3px;\n                              font-size:14px;\n                         \">Business one</div>\n\n                 <div style=\"margin-left:190.5px;\n                             margin-top:15px;\n                             font-size:13px;\n                             position:absolute;\n                             bottom:5px;\n                            \">\n                      <div>CEO office</div>\n                      <div style=\"margin-top:5px\">Corporate</div>\n                 </div>\n              </div>",
                totalSubordinates: 1
            }
        ];

        d3.json(
            "https://gist.githubusercontent.com/bumbeishvili/dc0d47bc95ef359fdc75b63cd65edaf2/raw/c33a3a1ef4ba927e3e92b81600c8c6ada345c64b/orgChart.json"
        ).then((data) => {
            console.warn('OrgChartComponent', data);
            this.data = this.dataOrg;


            if (!this.chart) {
                this.chart = new OrgChart();
            }
            this.updateChart();
        });
    }

    ngAfterViewInit() {
        if (!this.chart) { console.warn('this.chart', this.chart);
            this.chart = new OrgChart();
        }
        this.updateChart();
    }

    ngOnChanges() {
        this.updateChart();
    }

    updateChart() {
        if (!this.data) { console.warn('UNO');
            return;
        }
        if (!this.chart) { console.warn('DOS');
            return;
        }
        this.chart
            .container(this.chartContainer.nativeElement)
            .data(this.data)
            .nodeWidth(d => 300)
            .nodeHeight(d => 120)
            .onNodeClick(d => console.log(d + " node clicked"))
            .render();
    }*/

}
