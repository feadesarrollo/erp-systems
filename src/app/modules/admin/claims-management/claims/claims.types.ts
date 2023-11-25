export interface Category
{
    id?: string;
    nombre?: string;
}

export interface Claim
{
    id_reclamo?: number;
    id_tipo_incidente?: number;
    id_subtipo_incidente?: number;
    nro_tramite?: string;
    id_medio_reclamo?: number;
    id_funcionario_recepcion?: number;
    fecha_hora_incidente?: string;
    fecha_hora_recepcion?: string;
    id_cliente?: number;
    pnr?: string;
    nro_vuelo?: string;
    origen?: string;
    destino?: string;
    id_oficina_registro_incidente?: number;
    nro_frd?: string;
    nro_frsa?: number;
    nro_pir?: number;
    nro_att_canalizado?: number;
    nro_ripat_att?: number;
    nro_hoja_ruta?: number;
    id_funcionario_denunciado?: number;
    detalle_incidente?: string;
    observaciones_incidente?: string;
    id_proceso_wf?: number;
    id_estado_wf?: number;
    estado?: string;
    correlativo_preimpreso_frd?: number;
    fecha_limite_respuesta?: string;
    fecha_hora_vuelo?: string;
    id_gestion?: number;
    id_motivo_anulado?: number;
    fecha_recepcion_sac?: string;
    transito?: string;
    nro_guia_aerea?: string;
    revisado?: string;
    cliente?: string;
    progreso?: string;
    duracion?: number;
    func_recepcion?: string;
    func_denunciado?: string;
    desc_nom_cliente?: string;
}
