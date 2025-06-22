import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function DatosCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleObtenerDatos = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalDatosError').showModal();
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/datos?bd=${baseDatosSeleccionada}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.text();

            // Mostrar el resultado en el textarea global
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = data;
            }

        } catch (error) {
            console.error('Error al obtener datos:', error);
            // Mostrar error en el textarea
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al obtener datos de la base de datos: ${error.message}`;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-green-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Datos de Base:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={setBaseDatosSeleccionada}
                            placeholder="Selecciona base de datos"
                            className="select select-success w-full"
                        />
                    </div>

                    {/* Botón obtener datos */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-success"
                            onClick={handleObtenerDatos}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Obteniendo...
                                </>
                            ) : (
                                'Obtener Datos'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de error */}
            <dialog id="modalDatosError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos para obtener los datos.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}
