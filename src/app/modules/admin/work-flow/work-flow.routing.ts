import {Route} from "@angular/router";
import {WorkFlowComponent} from "./work-flow.component";
import {WorkFlowListComponent} from "./work-flow-list/work-flow-list.component";
import {WorkFlowDetailsComponent} from "./work-flow-details/work-flow-details.component";
import {WorkFlowListResolvers} from "./work-flow-list/work-flow-list.resolvers";

export const workFlowRoutes: Route[] = [
    {
        path: 'process-type',
        component: WorkFlowComponent,
        children:[
            {
                path: '',
                component: WorkFlowListComponent,
                resolve: {
                    workFlowList: WorkFlowListResolvers
                },
                children: [
                    {
                        path: ':id',
                        component: WorkFlowDetailsComponent
                    }
                ]
            }
        ]

    }
];
