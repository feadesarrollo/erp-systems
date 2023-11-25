export interface Entity {
    id?: number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: string;
    endDate?: string;
    countryId?: number;
    entityName?: string;
}

export interface AtoCategorie {
    categorie?: number;
    atoId?: number;
    id?: number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: number;
    endDate?: string;
}

export interface AircraftWeight {
    aeronaveId?: number;
    mtow?: number;
    estado?: number;
    usrRegistro?: string;
    id?: number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: number;
    endDate?: string;
}

export interface RateLanding {
    paisId?: number;
    entidadId?: number;
    categoriaAtoId?: number;
    servicio?: string;
    tipoTrafico?: string;
    pesoMinimo?: number;
    pesoMaximo?: number;
    tarifa?: number;
    monedaId?: number;
    id?:number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: number;
    endDate?: string;
}

export interface RateSurcharge {
    tarifaDomingo?: number;
    tarifaFeriado?: number;
    tarifaSemana?: number;
    servicio?: string;
    tarifaAterrizajeId?: number;
    porcentaje?: number;
    fromula?: string;
    startHr?: string;
    endHr?: string;
    id?: number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: number;
    endDate?: string;
}

export interface RateParking {
    minSinCosto?: number;
    hrsEstacionamiento?: number;
    tarifaAterrizajeId?: number;
    porcentaje?: number;
    fromula?: string;
    id?: number;
    code?: string;
    name?: string;
    detail?: string;
    startDate?: number;
    endDate?: string;
}
