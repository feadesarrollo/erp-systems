import {Component, Input, OnInit} from '@angular/core';
import {Select} from "@ngxs/store";
import {ClaimsManagementState} from "../../../../../../../store/claims-management/claims-management.state";
import { Observable } from 'rxjs';

@Component({
  selector: 'erp-answer-template',
  templateUrl: './answer-template.component.html'
})
export class AnswerTemplateComponent implements OnInit {

    /******************************** STORE ********************************/
    @Select(ClaimsManagementState.getPermissions) permission$: Observable<any>;
    /******************************** STORE ********************************/
    @Input() answer: any;
    content: any;
    constructor() { }

    ngOnInit(): void {
        this.content = this.answer.respuesta;
    }

}
