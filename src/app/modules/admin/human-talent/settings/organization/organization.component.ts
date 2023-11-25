import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ElementRef
} from '@angular/core';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { HumanTalentService } from "../../human-talent.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BobyConfirmationService } from "../../../../../../@boby/services/confirmation";
//import { Tree } from "primeng/tree";

@Component({
    selector: 'erp-organization',
    templateUrl: './organization.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationComponent implements OnInit {

    orga: TreeNode[] = [];
    loading: boolean = false;
    private configForm: FormGroup;
    private allow:boolean = true;
    public ordenEditMode: boolean = false;
    //@ViewChild(Tree) tree: Tree;
    constructor(
        private nodeService: MessageService,
        private _htService: HumanTalentService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _fcService: BobyConfirmationService
    ) { }

    ngOnInit() {

        this.loading = true;
        this._htService.getOrgaData(0).subscribe((resp)=>{
            this.orga = [];
            for(let i = 0; i < resp.length; i++) {
                resp[i].editar = false;
                let node = {
                    data: resp[i],
                    leaf: false
                };
                this.orga.push(node);
            }

            this.loading = false;
            this._changeDetectorRef.markForCheck();
        });
    }

    onNodeExpand(event) {
        this.loading = true;
        this._htService.getOrgaData(event.node.data.id_uo).subscribe((resp)=>{

                const children = [];
                this.loading = false;
                const node = event.node;
                for(let i = 0; i < resp.length; i++) {
                    resp[i].editar = false;
                    let node = {
                        data:resp[i],
                        leaf: !resp[i].node_type,
                        expandedIcon: 'pi pi-folder-open',
                        collapsedIcon: 'pi pi-folder'
                    };
                    children.push(node);
                }

                node.children = children;

                this.orga = [...this.orga];
            this._changeDetectorRef.markForCheck();
            }
        );
    }

    onDrop(event) {
        let drag = event.dragNode.data;
        let drop = event.dropNode.data;
        this._htService.putOrganizationData(drag, drop).subscribe((resp)=>{
        });
    }

    /**
     * Update the unit order
     *
     * @param node
     * @param event
     */
    updateOrder(node,event): void
    {
        if ( event.target.value != '' ){
            node.orden =  event.target.value;
            this._htService.postUnitOrder({id_estructura_uo: node.id_estructura_uo, orden: event.target.value}).subscribe((resp)=>{
            });
        }
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: any): void
    {

    }

    /**
     * Toggle the orden edit mode
     */
    toggleOrdenEditMode(node): void
    {
        this.ordenEditMode = !this.ordenEditMode;
        node.editar = !node.editar;
    }

}
