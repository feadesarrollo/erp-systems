import {BehaviorSubject, Observable} from 'rxjs';
/*export interface InnerNode {
    //data: any;
    children?: InnerNode[];
}

export interface LeafNode {
    //data: any;
    expandable: boolean;
    level: number;
}*/

export class LoadMoreNode {

    childrenChange = new BehaviorSubject<LoadMoreNode[]>([]);

    get children(): LoadMoreNode[] {
        return this.childrenChange.value;
    }

    constructor(
        public id: string,
        public hasChildren = false,
        public item: any | null = null,
        public loadMoreParentItem: string | null = null
    ) {}
}

export class LeafNode {
    constructor(
        public id: string,
        public level = 0,
        public expandable = false,
        public item: any | null = null,
        public loadMoreParentItem: string | null = null
    ) {}
}

/**
 * Node for to-do item
 */
export class TodoItemNode {
    childrenChange = new BehaviorSubject<TodoItemNode[]>([]);
    get children(): TodoItemNode[] {
        return this.childrenChange.value;
    }

    constructor(
        public id: string,
        public hasChildren = false,
        public item: any | null = null
    ) {}
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    constructor(
        public id: string,
        public level = 0,
        public expandable = false,
        public item: any | null = null,
        public isLoading = false
    ) {}
}


/**
 * Node for to-do item
 */
/*export class TodoItemNode {
    children: TodoItemNode[];
    item: string;
}*/

/** Flat to-do item node with expandable and level information */
/*export class TodoItemFlatNode {
    item: string;
    level: number;
    expandable: boolean;
}*/

export type CalendarEventPanelMode = 'view' | 'add' | 'edit';
export type CalendarEventEditMode = 'single' | 'future' | 'all';


/**
 * Node for to-do item
 */
export class ramaNode {
    children?: ramaNode[];
    haschildren: boolean;
    item: any;
}

/** Flat to-do item node with expandable and level information */
export class hojaNode {
    level: number;
    expandable: boolean;
    item: any;
}

