import { Route } from '@angular/router';
import { ClaimComponent } from './claim/claim.component';
import { ClaimDetailsComponent } from './claim/claim-details/claim-details.component';
import { ClaimListComponent } from './claim/claim-list/claim-list.component';
import { ClaimResolver, ClaimsResolver } from './claims.resolvers';

import { AnswerComponent } from './answer/answer.component';
import { AnswerListComponent } from './answer/answer-list/answer-list.component';
import { AnswerDetailsComponent } from "./answer/answer-details/answer-details.component";
import {AnswerResolver, AnswersResolver} from "./answers.resolvers";
import {ClaimRipatComponent} from "./claim/claim-ripat/claim-ripat.component";
import {OfficialsComponent} from "../../human-talent/processes/officials/officials.component";
import {ClaimNewComponent} from "./claim/claim-new/claim-new.component";

export const claimsRoutes: Route[] = [

    {
        path: 'claim',
        component: ClaimComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: ClaimListComponent,
                resolve: {
                    claims: ClaimsResolver
                }
            },
            {
                path     : ':id',
                component: ClaimDetailsComponent,
                resolve : {
                    claim : ClaimResolver
                }
            },
            {
                path: 'new-claim/:id',
                component: ClaimNewComponent
            }
        ]
    },
    {
        path: 'answer',
        component: AnswerComponent,
        children : [
            {
                path     : '',
                pathMatch: 'full',
                component: AnswerListComponent,
                resolve: {
                    answers: AnswersResolver
                }
            },
            {
                path     : ':id',
                component: AnswerDetailsComponent,
                resolve : {
                    answer : AnswerResolver
                }
            }
        ]
    }
];
