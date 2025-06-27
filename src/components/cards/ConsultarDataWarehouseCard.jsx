import React, { useState, useEffect } from 'react';

export default function ConsultarDataWarehouseCard({ onEjecutarConsulta }) {
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseSeleccionado, setWarehouseSeleccionado] = useState('');
    const [consultaSQL, setConsultaSQL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);

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

    const handleEjecutarConsulta = async () => {
        if (!warehouseSeleccionado) {
            document.getElementById('modalConsultarDataWarehouseWarehouseError').showModal();
            return;
        }

        if (!consultaSQL.trim()) {
            document.getElementById('modalConsultarDataWarehouseQueryError').showModal();
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/consultaSelect?bd=${warehouseSeleccionado}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Respuesta de consulta Data Warehouse:', data);

            if (onEjecutarConsulta) {
                console.log('Llamando onEjecutarConsulta con:', { consultaSQL, warehouseSeleccionado, data });
                await onEjecutarConsulta(consultaSQL, warehouseSeleccionado, data);
            } else {
                console.warn('onEjecutarConsulta no está definida');
            }

        } catch (error) {
            console.error('Error al ejecutar consulta:', error);
            document.getElementById('modalConsultarDataWarehouseError').showModal();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-teal-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Consultar Data Warehouse</h2>

                    {/* Selector de Data Warehouse */}
                    <div className="form-control">
                        <select
                            className="select select-bordered select-info w-full"
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

                    {/* Consulta SQL */}
                    <div className="form-control">
                        <textarea
                            className="textarea textarea-bordered textarea-info w-full h-16 font-mono text-sm"
                            placeholder="SELECT * FROM tabla_principal WHERE..."
                            value={consultaSQL}
                            onChange={(e) => setConsultaSQL(e.target.value)}
                        />
                    </div>

                    {/* Información de ayuda */}
                    {warehouseSeleccionado && (
                        <div className="bg-info bg-opacity-20 p-3 rounded-lg">
                            <p className="text-white text-xs mb-2">
                                💡 <strong>Tips para consultar "{warehouseSeleccionado}":</strong>
                            </p>
                            <ul className="text-white text-xs space-y-1 ml-4">
                                <li>• Usa <code className="bg-black bg-opacity-30 px-1 rounded">SELECT * FROM tabla_principal</code> para ver todos los datos</li>
                                <li>• Los alias de columnas están disponibles según la configuración del Data Warehouse</li>
                                <li>• Puedes usar JOINs, WHERE, GROUP BY, etc. como en SQL normal</li>
                            </ul>
                        </div>
                    )}

                    {/* Botón ejecutar */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-info"
                            onClick={handleEjecutarConsulta}
                            disabled={isLoading || !warehouseSeleccionado || !consultaSQL.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Ejecutando...
                                </>
                            ) : (
                                'Ejecutar Consulta'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modales de Error */}
            <dialog id="modalConsultarDataWarehouseWarehouseError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona un Data Warehouse.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalConsultarDataWarehouseWarehouseError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalConsultarDataWarehouseQueryError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, escribe una consulta SQL.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalConsultarDataWarehouseQueryError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalConsultarDataWarehouseError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Error al ejecutar la consulta en el Data Warehouse.</p>
                    <div className="modal-action">
                        <button
                            className="btn"
                            onClick={() => document.getElementById('modalConsultarDataWarehouseError').close()}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
