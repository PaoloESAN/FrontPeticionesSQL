import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import { ModalConsultaPersonalizada } from '../AllModal';

export default function ConsultaPersonalizadaCard({ onEjecutarConsulta }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [consultaSQL, setConsultaSQL] = useState('');
    const [isExecuting, setIsExecuting] = useState(false); const handleEjecutar = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalConsultaPersonalizadaErrorValidacion').showModal();
            return;
        }

        if (!consultaSQL.trim()) {
            document.getElementById('modalConsultaPersonalizadaErrorValidacion').showModal();
            return;
        }

        setIsExecuting(true);
        try {
            console.log('Ejecutando consulta personalizada:', consultaSQL);
            console.log('Base de datos:', baseDatosSeleccionada);

            const consultaLimpia = consultaSQL.trim();
            // Detectar si es una consulta SELECT
            const esSELECT = consultaLimpia.toUpperCase().startsWith('SELECT');

            if (esSELECT) {
                // Usar el nuevo endpoint para consultas SELECT
                const response = await fetch(`http://localhost:8080/api/consultaSelect?bd=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaLimpia)}`, {
                    method: 'GET',
                });

                if (response.ok) {
                    const data = await response.json();
                    // Llamar a la función del padre para procesar los resultados
                    await onEjecutarConsulta(consultaLimpia, baseDatosSeleccionada, data);
                } else {
                    document.getElementById('modalConsultaPersonalizadaError').showModal();
                    const errorData = await response.text();
                    console.error('Error en la consulta:', errorData);
                }
            } else {
                // Para otras consultas (INSERT, UPDATE, DELETE), usar el endpoint original
                await onEjecutarConsulta(consultaLimpia, baseDatosSeleccionada);
            }
        } catch (error) {
            console.error('Error al ejecutar consulta:', error);
            document.getElementById('modalConsultaPersonalizadaError').showModal();
        } finally {
            setIsExecuting(false);
        }
    };

    const limpiarConsulta = () => {
        setConsultaSQL('');
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body">
                <h2 className="card-title text-white mb-2">Consulta personalizada:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center mt-2 mb-2'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={setBaseDatosSeleccionada}
                        placeholder="Selecciona base de datos"
                        className="select select-warning flex-1"
                    />
                </div>

                {/* Área de texto para consulta SQL */}
                <div className='flex flex-col mt-2'>
                    <textarea
                        placeholder="Escribe tu consulta SQL aquí..."
                        className="textarea textarea-warning w-full h-16"
                        value={consultaSQL}
                        onChange={(e) => setConsultaSQL(e.target.value)}
                        disabled={baseDatosSeleccionada === ''}
                    />
                    <div className="flex justify-between card-actions">
                        <button
                            className="btn btn-ghost btn-xs"
                            onClick={limpiarConsulta}
                            disabled={!consultaSQL}
                        >
                            Limpiar
                        </button>
                        <button
                            className="btn btn-soft btn-warning mt-4"
                            onClick={handleEjecutar}
                            disabled={isExecuting || !baseDatosSeleccionada || !consultaSQL.trim()}
                        >
                            {isExecuting ? 'Ejecutando...' : 'Ejecutar Consulta'}
                        </button>
                    </div>
                </div>                {/* Botones */}
            </div>

            <ModalConsultaPersonalizada />
        </div>
    );
}
