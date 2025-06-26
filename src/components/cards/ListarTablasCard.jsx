import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function ListarTablasCard({ onMostrarEnTextarea }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleListarTablas = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalListarTablasError').showModal();
            return;
        }

        // Primero mostrar el textarea con estado de carga
        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/tablas?nombre=${baseDatosSeleccionada}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            let resultado = '';
            if (Array.isArray(data) && data.length > 0) {
                resultado = `=== TABLAS EN LA BASE DE DATOS "${baseDatosSeleccionada}" ===\n\n`;
                data.forEach((tabla, index) => {
                    resultado += `${index + 1}. ${tabla}\n`;
                });
                resultado += `\nTotal de tablas: ${data.length}`;
            } else {
                resultado = `No se encontraron tablas en la base de datos "${baseDatosSeleccionada}".`;
            }

            // Mostrar el resultado
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = resultado;
            }

        } catch (error) {
            console.error('Error al listar tablas:', error);
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al obtener la lista de tablas: ${error.message}`;
            }
            if (onMostrarEnTextarea) {
                onMostrarEnTextarea();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-cyan-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Listar Tablas:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={setBaseDatosSeleccionada}
                            placeholder="Selecciona base de datos"
                            className="select select-info flex-1"
                        />
                    </div>

                    {/* Botón para listar tablas */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-info"
                            onClick={handleListarTablas}
                            disabled={isLoading || !baseDatosSeleccionada}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Obteniendo...
                                </>
                            ) : (
                                'Listar Tablas'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de error */}
            <dialog id="modalListarTablasError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos para listar las tablas.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalListarTablasError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
