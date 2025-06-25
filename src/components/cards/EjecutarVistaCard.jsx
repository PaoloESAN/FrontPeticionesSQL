import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import VistaSelector from './VistaSelector';

export default function EjecutarVistaCard({ onEjecutarConsulta }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [vistaSeleccionada, setVistaSeleccionada] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const handleEjecutar = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEjecutarVistaErrorBase').showModal();
            return;
        }

        if (!vistaSeleccionada) {
            document.getElementById('modalEjecutarVistaErrorVista').showModal();
            return;
        }

        setIsExecuting(true); try {
            // Construir la consulta SQL para ejecutar la vista
            const consultaSQL = `SELECT * FROM ${vistaSeleccionada}`;

            console.log('Ejecutando vista:', consultaSQL);
            console.log('Base de datos:', baseDatosSeleccionada);

            // Usar el nuevo endpoint para consultas SELECT (vistas)
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
                document.getElementById('modalEjecutarVistaError').showModal();
                const errorData = await response.text();
                console.error('Error al ejecutar vista:', errorData);
            }

        } catch (error) {
            console.error('Error al ejecutar vista:', error);
            document.getElementById('modalEjecutarVistaError').showModal();
        } finally {
            setIsExecuting(false);
        }
    };

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        // Limpiar vista cuando cambia la base
        setVistaSeleccionada('');
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Ejecutar Vista:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={handleBaseDatosChange}
                            placeholder="Selecciona base de datos"
                            className="select select-accent flex-1"
                        />
                    </div>

                    {/* Selector de vista */}
                    <div className='flex flex-row gap-2 items-center'>
                        <VistaSelector
                            baseDatos={baseDatosSeleccionada}
                            value={vistaSeleccionada}
                            onVistaChange={setVistaSeleccionada}
                            placeholder="Selecciona vista"
                            className="select select-accent flex-1"
                        />
                    </div>

                    {/* Botón para ejecutar */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-secondary"
                            onClick={handleEjecutar}
                            disabled={isExecuting || !baseDatosSeleccionada || !vistaSeleccionada}
                        >
                            {isExecuting ? 'Ejecutando...' : 'Ejecutar Vista'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales de error y éxito */}
            <ModalEjecutarVistaErrores />
        </>
    );
}

// Componente con todos los modales de error y éxito
function ModalEjecutarVistaErrores() {
    return (
        <>
            {/* Error: Base de datos no seleccionada */}
            <dialog id="modalEjecutarVistaErrorBase" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error: Vista no seleccionada */}
            <dialog id="modalEjecutarVistaErrorVista" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Por favor, selecciona una vista para ejecutar.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error general */}
            <dialog id="modalEjecutarVistaError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error al Ejecutar Vista</h3>
                    <p className="py-4">Ocurrió un error al ejecutar la vista. Verifica que la vista exista y sea válida.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>                </div>
            </dialog>
        </>
    );
}
