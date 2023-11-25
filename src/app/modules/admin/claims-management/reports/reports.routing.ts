import { Route } from '@angular/router';
import { CrmGlobalComponent } from './crm-global/crm-global.component';
import { ClaimBookComponent } from './claim-book/claim-book.component';
import { AnswerBookComponent } from './answer-book/answer-book.component';


export const reportsRoutes: Route[] = [
    {
        path: 'crm-global',
        component: CrmGlobalComponent,
    },
    {
        path: 'claim-book',
        component: ClaimBookComponent,
    },
    {
        path: 'answer-book',
        component: AnswerBookComponent,
    }
];
