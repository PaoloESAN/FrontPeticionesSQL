import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import ProcedureSelector from './ProcedureSelector';

export default function EjecutarProcedureCard({ onEjecutarConsulta }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [procedureSeleccionado, setProcedureSeleccionado] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleEjecutar = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEjecutarProcedureErrorBase').showModal();
            return;
        }

        if (!procedureSeleccionado) {
            document.getElementById('modalEjecutarProcedureErrorProcedure').showModal();
            return;
        }

        setIsExecuting(true);

        try {
            // Construir la consulta SQL para ejecutar el stored procedure
            const consultaSQL = `CALL ${procedureSeleccionado}()`;

            console.log('Ejecutando procedure:', consultaSQL);
            console.log('Base de datos:', baseDatosSeleccionada);

            // Usar el nuevo endpoint para consultas SELECT (procedures)
            const response = await fetch(`http://localhost:8080/api/consultaSelect?bd=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                // Llamar a la función del padre para procesar los resultados
                if (onEjecutarConsulta) {
                    await onEjecutarConsulta(consultaSQL, baseDatosSeleccionada, data);
                }
            } else {
                document.getElementById('modalEjecutarProcedureError').showModal();
                const errorData = await response.text();
                console.error('Error al ejecutar procedure:', errorData);
            }

        } catch (error) {
            console.error('Error al ejecutar procedure:', error);
            document.getElementById('modalEjecutarProcedureError').showModal();
        } finally {
            setIsExecuting(false);
        }
    };

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setProcedureSeleccionado('');
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Ejecutar Procedure:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={handleBaseDatosChange}
                            placeholder="Selecciona base de datos"
                            className="select select-accent flex-1"
                        />
                    </div>

                    {/* Selector de procedure */}
                    <div className='flex flex-row gap-2 items-center'>
                        <ProcedureSelector
                            baseDatos={baseDatosSeleccionada}
                            value={procedureSeleccionado}
                            onProcedureChange={setProcedureSeleccionado}
                            placeholder="Selecciona procedure"
                            className="select select-accent flex-1"
                        />
                    </div>

                    {/* Botón para ejecutar */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-secondary"
                            onClick={handleEjecutar}
                            disabled={isExecuting || !baseDatosSeleccionada || !procedureSeleccionado}
                        >
                            {isExecuting ? 'Ejecutando...' : 'Ejecutar Procedure'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales de error y éxito */}
            <ModalEjecutarProcedureErrores />
        </>
    );
}

// Componente de modales de error
function ModalEjecutarProcedureErrores() {
    return (
        <>
            <dialog id="modalEjecutarProcedureErrorBase" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalEjecutarProcedureErrorBase').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalEjecutarProcedureErrorProcedure" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona un stored procedure.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalEjecutarProcedureErrorProcedure').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalEjecutarProcedureError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Error al ejecutar el stored procedure. Verifica que sea válido.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalEjecutarProcedureError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
