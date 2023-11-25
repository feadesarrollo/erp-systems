import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BobyScrollbarModule } from '@boby/directives/scrollbar/public-api';
import { BobyHorizontalNavigationBasicItemComponent } from '@boby/components/navigation/horizontal/components/basic/basic.component';
import { BobyHorizontalNavigationBranchItemComponent } from '@boby/components/navigation/horizontal/components/branch/branch.component';
import { BobyHorizontalNavigationDividerItemComponent } from '@boby/components/navigation/horizontal/components/divider/divider.component';
import { BobyHorizontalNavigationSpacerItemComponent } from '@boby/components/navigation/horizontal/components/spacer/spacer.component';
import { BobyHorizontalNavigationComponent } from '@boby/components/navigation/horizontal/horizontal.component';
import { BobyVerticalNavigationAsideItemComponent } from '@boby/components/navigation/vertical/components/aside/aside.component';
import { BobyVerticalNavigationBasicItemComponent } from '@boby/components/navigation/vertical/components/basic/basic.component';
import { BobyVerticalNavigationCollapsableItemComponent } from '@boby/components/navigation/vertical/components/collapsable/collapsable.component';
import { BobyVerticalNavigationDividerItemComponent } from '@boby/components/navigation/vertical/components/divider/divider.component';
import { BobyVerticalNavigationGroupItemComponent } from '@boby/components/navigation/vertical/components/group/group.component';
import { BobyVerticalNavigationSpacerItemComponent } from '@boby/components/navigation/vertical/components/spacer/spacer.component';
import { BobyVerticalNavigationComponent } from '@boby/components/navigation/vertical/vertical.component';

@NgModule({
    declarations: [
        BobyHorizontalNavigationBasicItemComponent,
        BobyHorizontalNavigationBranchItemComponent,
        BobyHorizontalNavigationDividerItemComponent,
        BobyHorizontalNavigationSpacerItemComponent,
        BobyHorizontalNavigationComponent,
        BobyVerticalNavigationAsideItemComponent,
        BobyVerticalNavigationBasicItemComponent,
        BobyVerticalNavigationCollapsableItemComponent,
        BobyVerticalNavigationDividerItemComponent,
        BobyVerticalNavigationGroupItemComponent,
        BobyVerticalNavigationSpacerItemComponent,
        BobyVerticalNavigationComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        BobyScrollbarModule
    ],
    exports     : [
        BobyHorizontalNavigationComponent,
        BobyVerticalNavigationComponent
    ]
})
export class BobyNavigationModule
{
}
