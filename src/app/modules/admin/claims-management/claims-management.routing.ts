import { Route } from '@angular/router';

export const claimManagementRoutes: Route[] = [
    {
        path: 'claims',
        loadChildren: () => import('app/modules/admin/claims-management/claims/claims.module').then(m => m.ClaimsModule)
    },
    {
        path: 'settings',
        loadChildren: () => import('app/modules/admin/claims-management/settings/settings.module').then(m => m.SettingsModule)
    },
    {
        path: 'reports',
        loadChildren: () => import('app/modules/admin/claims-management/reports/reports.module').then(m => m.ReportsModule)
    },
    {
        path: 'administrator',
        loadChildren: () => import('app/modules/admin/claims-management/administrator/administrator.module').then(m => m.AdministratorModule)
    }
];
