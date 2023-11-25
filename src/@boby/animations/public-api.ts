import { expandCollapse } from '@boby/animations/expand-collapse';
import { fadeIn, fadeInBottom, fadeInLeft, fadeInRight, fadeInTop, fadeOut, fadeOutBottom, fadeOutLeft, fadeOutRight, fadeOutTop } from '@boby/animations/fade';
import { shake } from '@boby/animations/shake';
import { slideInBottom, slideInLeft, slideInRight, slideInTop, slideOutBottom, slideOutLeft, slideOutRight, slideOutTop } from '@boby/animations/slide';
import { zoomIn, zoomOut } from '@boby/animations/zoom';

export const bobyAnimations = [
    expandCollapse,
    fadeIn, fadeInTop, fadeInBottom, fadeInLeft, fadeInRight,
    fadeOut, fadeOutTop, fadeOutBottom, fadeOutLeft, fadeOutRight,
    shake,
    slideInTop, slideInBottom, slideInLeft, slideInRight,
    slideOutTop, slideOutBottom, slideOutLeft, slideOutRight,
    zoomIn, zoomOut
];
