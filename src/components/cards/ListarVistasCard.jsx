import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function ListarVistasCard({ onMostrarEnTextarea }) {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleListarVistas = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalListarVistasError').showModal();
            return;
        }

        // Primero mostrar el textarea con estado de carga
        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/vistas?bd=${baseDatosSeleccionada}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Formatear los datos para mostrar en el textarea
            let resultado = '';
            if (Array.isArray(data) && data.length > 0) {
                resultado = `=== VISTAS EN LA BASE DE DATOS "${baseDatosSeleccionada}" ===\n\n`;
                data.forEach((vista, index) => {
                    resultado += `${index + 1}. ${vista}\n`;
                });
                resultado += `\nTotal de vistas: ${data.length}`;
            } else {
                resultado = `No se encontraron vistas en la base de datos "${baseDatosSeleccionada}".`;
            }

            // Mostrar el resultado
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = resultado;
            }

        } catch (error) {
            console.error('Error al listar vistas:', error);
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al obtener la lista de vistas: ${error.message}`;
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
            <div className="card w-96 card-md shadow-lg bg-teal-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Listar Vistas:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={setBaseDatosSeleccionada}
                            placeholder="Selecciona base de datos"
                            className="select select-primary flex-1"
                        />
                    </div>

                    {/* Botón para listar vistas */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-primary"
                            onClick={handleListarVistas}
                            disabled={isLoading || !baseDatosSeleccionada}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Obteniendo...
                                </>
                            ) : (
                                'Listar Vistas'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de error */}
            <dialog id="modalListarVistasError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos para listar las vistas.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalListarVistasError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
