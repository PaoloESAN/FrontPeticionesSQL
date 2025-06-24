import React, { useState } from 'react';

export default function ListarBasesCard() {
    const [isLoading, setIsLoading] = useState(false);

    const handleListarBases = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/listarBases');

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            let resultado = '';
            if (Array.isArray(data) && data.length > 0) {
                resultado = `=== BASES DE DATOS DISPONIBLES ===\n\n`;
                data.forEach((base, index) => {
                    resultado += `${index + 1}. ${base}\n`;
                });
                resultado += `\nTotal de bases de datos: ${data.length}`;
            } else {
                resultado = 'No se encontraron bases de datos disponibles.';
            }

            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = resultado;
            }

        } catch (error) {
            console.error('Error al listar bases de datos:', error);
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al obtener la lista de bases de datos: ${error.message}`;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-blue-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Listar Bases de Datos:</h2>

                <div className="text-white text-sm opacity-80">
                    Mostrar todas las bases de datos disponibles en el servidor.
                </div>

                {/* Botón para listar bases */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-info"
                        onClick={handleListarBases}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Obteniendo...
                            </>
                        ) : (
                            'Listar Bases de Datos'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
