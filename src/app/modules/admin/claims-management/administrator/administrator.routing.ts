import { Route } from '@angular/router';
import { ParametersComponent } from "./parameters/parameters.component";

import { RolesComponent } from '../administrator/roles/roles.component';
import { RoleListComponent } from "../administrator/roles/role-list/role-list.component";
import { RolesResolver, RolesRolResolver } from "../administrator/roles/roles.resolvers";
import { RoleDetailsComponent } from "../administrator/roles/role-details/role-details.component";
import { CanDeactivateRolesDetails } from "../administrator/roles/roles.guards";
import { FileManagerListComponent } from "./file-manager/file-manager-list/file-manager-list.component";
import { FileManagerComponent } from "./file-manager/file-manager.component";
import { FileManagerDetailsComponent } from "./file-manager/file-manager-details/file-manager-details.component";
import { CanDeactivateRolesFileManager } from './file-manager/file-manager.guards';
import {
    FileManagerItemsResolver,
    FileManagerItemResolver,
    FileManagerFolderResolver
} from './file-manager/file-manager.resolvers';
import {GroupEmailsComponent} from "./group-emails/group-emails.component";


export const adminRoutes: Route[] = [
    {
        path: 'parameters',
        component: ParametersComponent
    },
    {
        path: 'group-emails',
        component: GroupEmailsComponent
    },
    {
        path: 'roles',
        component: RolesComponent,
        children : [
            {
                path     : '',
                component: RoleListComponent,
                resolve  : {
                    roles : RolesResolver
                },
                children : [
                    {
                        path         : ':id',
                        component    : RoleDetailsComponent,
                        resolve      : {
                            rol  : RolesRolResolver
                        },
                        canDeactivate: [CanDeactivateRolesDetails]
                    }
                ]
            }
        ]
    },
    {
        path     : 'file-manager',
        component: FileManagerComponent,
        children : [
            {
                path    : 'folders/:folderId',
                component: FileManagerListComponent,
                resolve : {
                    items: FileManagerFolderResolver
                },
                children: [
                    {
                        path         : 'details/:id',
                        component    : FileManagerDetailsComponent,
                        resolve      : {
                            item: FileManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateRolesFileManager]
                    }
                ]
            },
            {
                path     : '',
                component: FileManagerListComponent,
                resolve  : {
                    items: FileManagerItemsResolver
                },
                children : [
                    {
                        path         : 'details/:id',
                        component    : FileManagerDetailsComponent,
                        resolve      : {
                            item: FileManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateRolesFileManager]
                    }
                ]
            }
        ]
    }
    /*{
        path: '',
        component: FileManagerComponent,
        resolve  : {
            templates : FileManagerItemsResolver
        },
        children: [
            {
                path: 'file-manager',
                component: FileManagerListComponent,
                children: [
                    {
                        path        : 'details/:id',
                        component   :   FileManagerDetailsComponent,
                        resolve      : {
                            item: FileManagerItemResolver
                        },
                        canDeactivate: [CanDeactivateRolesFileManager]
                    }
                ]
            }
        ]
    }*/
];
