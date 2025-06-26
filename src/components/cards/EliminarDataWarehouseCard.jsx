import React, { useState, useEffect } from 'react';

export default function EliminarDataWarehouseCard() {
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseSeleccionado, setWarehouseSeleccionado] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);
    const [resultados, setResultados] = useState('');

    useEffect(() => {
        cargarWarehouses();
    }, []);

    const cargarWarehouses = async () => {
        setLoadingWarehouses(true);
        try {
            const response = await fetch('http://localhost:8080/api/datawarehouse/list');
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            const dataWarehouses = Array.isArray(data.warehouses)
                ? data.warehouses.filter(warehouse => warehouse.name.endsWith('_warehouse'))
                : [];

            setWarehouses(dataWarehouses);
        } catch (error) {
            console.error('Error al cargar warehouses:', error);
            setWarehouses([]);
        } finally {
            setLoadingWarehouses(false);
        }
    };

    const handleEliminarDataWarehouse = async () => {
        if (!warehouseSeleccionado) {
            document.getElementById('modalEliminarDataWarehouseError').showModal();
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/datawarehouse/delete/${warehouseSeleccionado}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            let resultado = `=== DATA WAREHOUSE ELIMINADO EXITOSAMENTE ===\n\n`;
            resultado += `Nombre: ${warehouseSeleccionado}\n`;
            resultado += `Mensaje: ${data.message}\n`;
            resultado += `Fecha de eliminación: ${new Date().toLocaleString()}\n`;

            setResultados(resultado);

            await cargarWarehouses();
            setWarehouseSeleccionado('');

            document.getElementById('modalEliminarDataWarehouseExito').showModal();

        } catch (error) {
            console.error('Error al eliminar Data Warehouse:', error);
            setResultados(`Error al eliminar Data Warehouse: ${error.message}`);
            document.getElementById('modalEliminarDataWarehouseErrorDelete').showModal();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-red-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Eliminar Data Warehouse</h2>

                    {/* Selector de Data Warehouse */}
                    <div className="form-control">
                        <select
                            className="select select-bordered select-error w-full"
                            value={warehouseSeleccionado}
                            onChange={(e) => setWarehouseSeleccionado(e.target.value)}
                            disabled={loadingWarehouses}
                        >
                            <option value="">
                                {loadingWarehouses ? 'Cargando...' : 'Selecciona un Data Warehouse'}
                            </option>
                            {warehouses.map((warehouse, index) => (
                                <option key={index} value={warehouse.name}>
                                    {warehouse.name} ({warehouse.table_count || 0} tablas)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón para eliminar */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-error"
                            onClick={handleEliminarDataWarehouse}
                            disabled={isLoading || !warehouseSeleccionado}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Eliminando...
                                </>
                            ) : (
                                'Eliminar Data Warehouse'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <dialog id="modalEliminarDataWarehouseError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona un Data Warehouse para eliminar.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalEliminarDataWarehouseError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalEliminarDataWarehouseExito" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-green-600">✅ Éxito</h3>
                    <div className="py-4">
                        <pre className="text-sm whitespace-pre-wrap">{resultados}</pre>
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            onClick={() => document.getElementById('modalEliminarDataWarehouseExito').close()}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalEliminarDataWarehouseErrorDelete" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error al Eliminar</h3>
                    <div className="py-4">
                        <pre className="text-sm whitespace-pre-wrap">{resultados}</pre>
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalEliminarDataWarehouseErrorDelete').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
