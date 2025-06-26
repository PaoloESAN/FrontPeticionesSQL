import React, { useState } from 'react';

export default function ListarDataWarehousesCard({ onMostrarEnTextarea }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleListarDataWarehouses = async () => {
        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/datawarehouse/list');

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Respuesta del endpoint datawarehouse/list:', data);

            let dataWarehouses = [];

            if (Array.isArray(data.warehouses)) {
                dataWarehouses = data.warehouses.filter(warehouse => warehouse.name.endsWith('_warehouse'));
            } else if (Array.isArray(data)) {
                dataWarehouses = data.filter(warehouse => warehouse.name && warehouse.name.endsWith('_warehouse'));
            } else if (data.databases && Array.isArray(data.databases)) {
                dataWarehouses = data.databases.filter(db => db.name && db.name.endsWith('_warehouse'));
            }

            console.log('Data warehouses filtrados:', dataWarehouses);

            let resultado = '';
            if (dataWarehouses.length > 0) {
                resultado = `=== DATA WAREHOUSES DISPONIBLES ===\n\n`;
                dataWarehouses.forEach((warehouse, index) => {
                    resultado += `${index + 1}. ${warehouse.name}\n`;
                    resultado += `   - Creado: ${warehouse.created_date || 'Fecha no disponible'}\n`;
                    resultado += `   - Tablas incluidas: ${warehouse.table_count || 0}\n`;
                    resultado += `   - Estado: ${warehouse.status || 'Activo'}\n\n`;
                });
                resultado += `Total de Data Warehouses: ${dataWarehouses.length}`;
            } else {
                resultado = 'No se encontraron Data Warehouses disponibles.';
            }

            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = resultado;
            }

        } catch (error) {
            console.error('Error al listar Data Warehouses:', error);
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al obtener la lista de Data Warehouses: ${error.message}`;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Listar Data Warehouses</h2>

                    <div className="text-white text-sm h-20 opacity-80">
                        Muestra todos los Data Warehouses creados en el sistema con su información básica.
                    </div>

                    {/* Botón para listar */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-info"
                            onClick={handleListarDataWarehouses}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Obteniendo...
                                </>
                            ) : (
                                'Listar Data Warehouses'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
