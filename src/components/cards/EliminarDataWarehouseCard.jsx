import React, { useState, useEffect } from 'react';

export default function EliminarDataWarehouseCard() {
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseSeleccionado, setWarehouseSeleccionado] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);

    useEffect(() => {
        cargarWarehouses();

        // Escuchar eventos de actualización de warehouses
        const handleWarehouseUpdate = () => {
            console.log('Evento recibido: actualizando lista de warehouses en EliminarDataWarehouseCard');
            cargarWarehouses();
        };

        window.addEventListener('datawarehouseCreated', handleWarehouseUpdate);
        window.addEventListener('datawarehouseDeleted', handleWarehouseUpdate);

        // Cleanup al desmontar el componente
        return () => {
            window.removeEventListener('datawarehouseCreated', handleWarehouseUpdate);
            window.removeEventListener('datawarehouseDeleted', handleWarehouseUpdate);
        };
    }, []);

    const cargarWarehouses = async () => {
        setLoadingWarehouses(true);
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

        document.getElementById('modalConfirmarEliminarDataWarehouse').showModal();
    }; const confirmarEliminacion = async () => {
        document.getElementById('modalConfirmarEliminarDataWarehouse').close();
        setIsLoading(true);

        try {
            console.log('Eliminando Data Warehouse:', warehouseSeleccionado);

            const response = await fetch(`http://localhost:8080/api/datawarehouse/delete/${encodeURIComponent(warehouseSeleccionado)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Actualizar lista y limpiar selección
            await cargarWarehouses();
            setWarehouseSeleccionado('');

            // Emitir evento para notificar a otros componentes
            console.log('Emitiendo evento datawarehouseDeleted');
            window.dispatchEvent(new CustomEvent('datawarehouseDeleted', {
                detail: { deletedWarehouse: warehouseSeleccionado }
            }));

            document.getElementById('modalEliminarDataWarehouseExito').showModal();

        } catch (error) {
            console.error('Error al eliminar Data Warehouse:', error);
            document.getElementById('modalEliminarDataWarehouseErrorDelete').showModal();
        } finally {
            setIsLoading(false);
        }
    };

    const cancelarEliminacion = () => {
        document.getElementById('modalConfirmarEliminarDataWarehouse').close();
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
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Advertencia de seguridad */}
                    {warehouseSeleccionado && (
                        <div className="bg-error bg-opacity-20 p-3 rounded-lg border border-error">
                            <p className="text-white text-xs">
                                <strong>Advertencia:</strong> Esta acción eliminará completamente el Data Warehouse "{warehouseSeleccionado}" y todos sus datos. No se puede deshacer.
                            </p>
                        </div>
                    )}

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
                    <h3 className="font-bold text-lg text-red-600">Error</h3>
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
                    <h3 className="font-bold text-lg text-green-600">Éxito</h3>
                    <p className="py-4">Data Warehouse eliminado exitosamente.</p>
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
                    <h3 className="font-bold text-lg text-red-600">Error al Eliminar</h3>
                    <p className="py-4">Ocurrió un error al eliminar el Data Warehouse. Por favor, intenta nuevamente.</p>
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

            {/* Modal de confirmación */}
            <dialog id="modalConfirmarEliminarDataWarehouse" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Estás seguro de que quieres eliminar el Data Warehouse "{warehouseSeleccionado}"?
                        <br />
                        <span className="text-warning font-semibold">Esta acción eliminará toda la base de datos y no se puede deshacer.</span>
                    </p>
                    <div className="modal-action">
                        <button
                            className="btn btn-ghost"
                            onClick={cancelarEliminacion}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-error"
                            onClick={confirmarEliminacion}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Eliminando...' : 'Eliminar Data Warehouse'}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
