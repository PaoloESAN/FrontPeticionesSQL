import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import TablaSelector from './TablaSelector';
import ColumnaSelector from './ColumnaSelector';
import { ModalConsultaBase } from '../AllModal';

export default function ConsultaCard({ onEjecutarConsulta }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tipoConsulta, setTipoConsulta] = useState('SELECT');
    const [tabla, setTabla] = useState('');
    const [columna, setColumna] = useState('');

    const construirConsultaSQL = () => {
        if (tipoConsulta === 'SELECT' && tabla && columna && baseDatosSeleccionada) {
            return `SELECT ${columna} FROM ${tabla}`;
        } else if (tipoConsulta === 'DELETE' && tabla && baseDatosSeleccionada) {
            return `DELETE FROM ${tabla}`;
        }

        return '';
    };

    const handleEjecutar = async () => {
        const consultaSQL = construirConsultaSQL(); if (!consultaSQL) {
            document.getElementById('modalConsultaErrorBase').showModal();
            return;
        }

        if (!baseDatosSeleccionada) {
            document.getElementById('modalConsultaErrorBase').showModal();
            return;
        }

        console.log('Ejecutando consulta:', consultaSQL);
        console.log('Base de datos:', baseDatosSeleccionada);

        await onEjecutarConsulta(consultaSQL, baseDatosSeleccionada);
    };

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        // Limpiar tabla y columna cuando cambia la base
        setTabla('');
        setColumna('');
    };

    const handleTablaChange = (nuevaTabla) => {
        setTabla(nuevaTabla);
        // Limpiar columna cuando cambia la tabla
        setColumna('');
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Ejecutar consulta:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={handleBaseDatosChange}
                        placeholder="Selecciona base de datos"
                        className="select select-accent w-full"
                    />
                </div>

                {/* Selectores de consulta */}
                <div className='flex flex-row gap-2 items-center'>
                    <select
                        className="select select-accent"
                        value={tipoConsulta}
                        onChange={(e) => setTipoConsulta(e.target.value)}
                    >
                        <option value="" disabled>Tipo de consulta</option>
                        <option value="SELECT">SELECT</option>
                        <option value="DELETE">DELETE</option>
                    </select>

                    <TablaSelector
                        baseDatos={baseDatosSeleccionada}
                        value={tabla}
                        onTablaChange={handleTablaChange}
                        placeholder="Selecciona tabla"
                        className="select select-accent"
                    />

                    <ColumnaSelector
                        baseDatos={baseDatosSeleccionada}
                        tabla={tabla}
                        value={columna}
                        onColumnaChange={setColumna}
                        placeholder="Selecciona columna"
                        className="select select-accent"
                        incluirAsterisco={tipoConsulta === 'SELECT'}
                    />
                </div>

                {/* Botón ejecutar */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-accent"
                        onClick={handleEjecutar}
                    >
                        Ejecutar
                    </button>                </div>
            </div>

            <ModalConsultaBase />
        </div>
    );
}
