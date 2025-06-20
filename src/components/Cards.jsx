import React from 'react';
import { CrearBaseCard, EliminarBaseCard, ConsultaCard, CrearTablaCard, EliminarTablaCard, CrearVistaCard, EliminarVistaCard, ConsultaPersonalizadaCard, DatosCard } from './cards/index.js';

export default function Cards({ crearBase, eliminar, ejecutarConsulta }) {
    return (
        <div className='flex flex-wrap gap-4 mt-4 ml-8 mr-11'>
            <CrearBaseCard onCrearBase={crearBase} />
            <EliminarBaseCard onEliminarBase={eliminar} />
            <CrearTablaCard />
            <EliminarTablaCard />
            <CrearVistaCard />
            <EliminarVistaCard />
            <ConsultaCard onEjecutarConsulta={ejecutarConsulta} />
            <ConsultaPersonalizadaCard onEjecutarConsulta={ejecutarConsulta} />
            <DatosCard />
        </div>
    );
}
