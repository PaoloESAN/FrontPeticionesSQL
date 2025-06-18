import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function ConsultaPersonalizadaCard({ onEjecutarConsulta }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [consultaSQL, setConsultaSQL] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleEjecutar = async () => {
        if (!baseDatosSeleccionada) {
            alert('Por favor, selecciona una base de datos');
            return;
        }

        if (!consultaSQL.trim()) {
            alert('Por favor, escribe una consulta SQL');
            return;
        }

        setIsExecuting(true);
        try {
            console.log('Ejecutando consulta personalizada:', consultaSQL);
            console.log('Base de datos:', baseDatosSeleccionada);

            await onEjecutarConsulta(consultaSQL.trim(), baseDatosSeleccionada);
        } catch (error) {
            console.error('Error al ejecutar consulta:', error);
            alert('Error al ejecutar la consulta: ' + error.message);
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
                        className="textarea textarea-warning w-full h-16 resize-none"
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
                </div>

                {/* Botones */}
            </div>
        </div>
    );
}
