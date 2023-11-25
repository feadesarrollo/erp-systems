export interface Landing {
    vueloId?: number;
    matricula?: string;
    mtow?: number;
    atoOACILlegada?: string;
    atoLlegada?: string;
    rutaLlegada?: string;
    tipoTrafico?: string;
    nroVueloLlegada?: string;
    fechaAterrizaje?: string;
    horaAterrizaje?: string;
    tarifaAterrizajeId?: number;
    importeAterrizaje?: string;
    importeRecargoNocturno?: string;
    importeRecargoDomingo?: string;
    importeFeriado?: string;
    importeTotalAterrizaje?: string;
    fechaLlegadaProv?: string;
    horaLlegadaProv?: string;
}

export interface Parking {
    vueloId?: number;
    matricula?: string;
    mtow?: number;
    atoLlegada?: string;
    rutaLlegada?: string;
    tipoTrafico?: string;
    fechaAterrizaje?: string;
    horaAterrizaje?: string;
    nroVueloAterrizaje?: string;
    rutaSalida?: string;
    fechaSalida?: string;
    horaDespegueSalida?: string;
    nroVueloSalida?: string;
    vueloIdSalida?: number;
    minParqueo?: string;
    oaciProcedenciaProv?: string;
    fechaLlegadaProv?: string;
    horaLlegadaProv?: string;
    oaciDestinoProv?: string;
    fechaSalidaProv?: string;
    horaDespegueSalidaProv?: string;
    minParqueoProv?: string;
    diferenciaMinParqueo?: string;
    importeTotalAterrizaje?: string;
    importeEstacionamientos?: string;
    observacion?: string;
}

export interface Fee {
    ato?: string;
    categoria?: string;
    entidad?: string;
    servicio?: string;
    tipoTrafico?: string;
    pesoMin?: string;
    pesoMax?: string;
    tarifa?: string;
    nombre?: string;
    prefijo?: string;
}
