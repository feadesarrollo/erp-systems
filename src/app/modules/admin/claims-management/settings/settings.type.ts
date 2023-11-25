import {BehaviorSubject, Observable} from 'rxjs';

export interface TreeNode<T = any> {
    label?: string;
    data?: T;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: TreeNode<T>[];
    leaf?: boolean;
    expanded?: boolean;
    type?: string;
    parent?: TreeNode<T>;
    partialSelected?: boolean;
    style?: string;
    styleClass?: string;
    draggable?: boolean;
    droppable?: boolean;
    selectable?: boolean;
    key?: string;
}

/** Nested node PLAN B */
export class LoadmoreNode {
    childrenChange = new BehaviorSubject<LoadmoreNode[]>([]);

    get children(): LoadmoreNode[] {
        return this.childrenChange.value;
    }

    constructor(public item: string,
                public hasChildren = false,
                public loadMoreParentItem: string | null = null,
                public comp: object | null = null) {}
}

/** Flat node with expandable and level information */
export class LoadmoreFlatNode {
    constructor(public item: string,
                public level = 1,
                public expandable = false,
                public loadMoreParentItem: string | null = null,
                public comp: object | null = null) {}
}

/** Nested node PLAN B */

export interface IncidentTypeNode {
    expandable: boolean;
    data: any;
    level: number;
}

export interface FoodNode {
    data: any;
    children?: FoodNode[];
}

export interface ExampleFlatNode {
    data: any;
    expandable: boolean;
    level: number;
}

export interface Customer {
    id_cliente?: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    nombre_completo1?: string;
    nombre_completo2?: string;

    genero?: string;
    ci?: string;
    lugar_expedicion?: string;
    nacionalidad?: string;
    celular?: string;
    telefono?: string;
    email?: string;
    email2?: string;
    direccion?: string;
    id_pais_residencia?: string;
    pais_residencia?: string;
    ciudad_residencia?: string;
    barrio_zona?: string;

    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}

export interface Compensacion {
    id_compensacion?: string;
    codigo?: string;
    nombre?: string;
    orden?: number;
    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}

export interface Holiday {
    id_feriado?: string;
    fecha?: string;
    descripcion?: string;
    id_lugar?: string;
    estado?: string;
    id_origen?: string;
    lugar?: string;

    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}

export interface HalfClaim {
    id_medio_reclamo?: string;
    codigo?: string;
    nombre_medio?: string;
    orden?: number;
    estado_reg?: string;
    fecha_mod?: string;
    fecha_reg?: string;
    id_usuario_ai?: string;
    id_usuario_mod?: string;
    id_usuario_reg?: string;
    usr_mod?: string;
    usr_reg?: string;
    usuario_ai?: string;
}

export interface Compensation {
    id_compensacion?: string;
    codigo?: string;
    nombre?: string;
    orden?: number;
    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}

export interface CancellationReason {
    id_motivo_anulado?: string;
    motivo?: string;
    orden?: number;
    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}

export interface Office {
    id_oficina?: string;
    id_lugar?: string;
    codigo?: string;
    nombre?: string;
    nombre_lugar?: string;
    correo_oficina?: string;
    aeropuerto?: string;
    direccion?: string;
    estado_reg?: string;
    fecha_reg?: string;
    fecha_mod?: string;
    id_usuario_reg?: string;
    id_usuario_mod?: string;
    usr_reg?: string;
    usr_mod?: string;
    id_usuario_ai?: string;
    usuario_ai?: string;
}
