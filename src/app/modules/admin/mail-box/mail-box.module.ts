import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { QuillModule } from 'ngx-quill';
import { BobyFindByKeyPipeModule } from '@boby/pipes/find-by-key';
import { BobyNavigationModule } from '@boby/components/navigation';
import { BobyScrollbarModule } from '@boby/directives/scrollbar';
import { BobyScrollResetModule } from '@boby/directives/scroll-reset';
import { SharedModule } from 'app/shared/shared.module';

import { MailBoxComponent } from './mail-box.component';
import { MailBoxListComponent } from './mail-box-list/mail-box-list.component';
import { MailBoxDetailsComponent } from './mail-box-details/mail-box-details.component';
import { MailBoxComposeComponent } from './mail-box-compose/mail-box-compose.component';
import { MailBoxSettingsComponent } from './mail-box-settings/mail-box-settings.component';

import { mailboxRoutes } from './mail-box.routing';
import { MailBoxSidebarComponent } from './mail-box-sidebar/mail-box-sidebar.component';


@NgModule({
  declarations: [
    MailBoxComponent,
    MailBoxListComponent,
    MailBoxDetailsComponent,
    MailBoxComposeComponent,
    MailBoxSettingsComponent,
    MailBoxSidebarComponent
  ],
  imports: [
      RouterModule.forChild(mailboxRoutes),
      MatButtonModule,
      MatCheckboxModule,
      MatDialogModule,
      MatDividerModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatMenuModule,
      MatProgressBarModule,
      MatSelectModule,
      MatSidenavModule,
      QuillModule.forRoot(),
      BobyFindByKeyPipeModule,
      BobyNavigationModule,
      BobyScrollbarModule,
      BobyScrollResetModule,
      SharedModule
  ]
})
export class MailBoxModule { }
