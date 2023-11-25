import { IsActiveMatchOptions } from '@angular/router';

export interface BobyNavigationItem
{
    id?: string;
    title?: string;
    subtitle?: string;
    type:
        | 'aside'
        | 'basic'
        | 'collapsable'
        | 'divider'
        | 'group'
        | 'spacer';
    hidden?: (item: BobyNavigationItem) => boolean;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
    link?: string;
    externalLink?: boolean;
    target?:
        | '_blank'
        | '_self'
        | '_parent'
        | '_top'
        | string;
    exactMatch?: boolean;
    isActiveMatchOptions?: IsActiveMatchOptions;
    function?: (item: BobyNavigationItem) => void;
    classes?: {
        title?: string;
        subtitle?: string;
        icon?: string;
        wrapper?: string;
    };
    icon?: string;
    badge?: {
        title?: string;
        classes?: string;
    };
    children?: BobyNavigationItem[];
    meta?: any;
}

export type BobyVerticalNavigationAppearance =
    | 'default'
    | 'compact'
    | 'dense'
    | 'thin';

export type BobyVerticalNavigationMode =
    | 'over'
    | 'side';

export type BobyVerticalNavigationPosition =
    | 'left'
    | 'right';
