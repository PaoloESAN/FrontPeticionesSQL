import React, { useState, useEffect } from 'react';

export default function CrearDataWarehouseCard({ onMostrarEnTextarea }) {
    const [nombreDataWarehouse, setNombreDataWarehouse] = useState('');
    const [databasesTablas, setDatabasesTablas] = useState([]);
    const [tablasSeleccionadas, setTablasSeleccionadas] = useState([]);
    const [relaciones, setRelaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDatabases, setLoadingDatabases] = useState(false);
    const [columnasTablas, setColumnasTablas] = useState({});

    useEffect(() => {
        cargarDatabasesYTablas();
    }, []);

    const cargarDatabasesYTablas = async () => {
        setLoadingDatabases(true);
        try {
            const response = await fetch('http://localhost:8080/api/datawarehouse/databases-tables');
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setDatabasesTablas(data.databases || []);
        } catch (error) {
            console.error('Error al cargar databases y tablas:', error);
            document.getElementById('modalDataWarehouseError').showModal();
        } finally {
            setLoadingDatabases(false);
        }
    };

    const cargarColumnasTabla = async (database, table) => {
        const key = `${database}.${table}`;
        if (columnasTablas[key]) return;

        try {
            const response = await fetch(`http://localhost:8080/api/datawarehouse/table-columns?database=${database}&table=${table}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setColumnasTablas(prev => ({
                ...prev,
                [key]: data.columns || []
            }));
        } catch (error) {
            console.error('Error al cargar columnas:', error);
        }
    };

    const agregarTablaSeleccionada = (database, table) => {
        const id = Date.now();
        const nuevaTabla = {
            id,
            database,
            table,
            alias: `${table}_${database}`
        };
        setTablasSeleccionadas(prev => [...prev, nuevaTabla]);
        cargarColumnasTabla(database, table);
    };

    const removerTablaSeleccionada = (id) => {
        setTablasSeleccionadas(prev => prev.filter(tabla => tabla.id !== id));
        setRelaciones(prev => prev.filter(rel =>
            rel.tabla1Id !== id && rel.tabla2Id !== id
        ));
    };

    const actualizarAlias = (id, nuevoAlias) => {
        setTablasSeleccionadas(prev =>
            prev.map(tabla =>
                tabla.id === id ? { ...tabla, alias: nuevoAlias } : tabla
            )
        );
    };

    const agregarRelacion = () => {
        if (tablasSeleccionadas.length < 2) return;

        const nuevaRelacion = {
            id: Date.now(),
            tabla1Id: tablasSeleccionadas[0].id,
            tabla1Columna: '',
            tabla2Id: tablasSeleccionadas[1].id,
            tabla2Columna: '',
            tipo: 'INNER_JOIN'
        };
        setRelaciones(prev => [...prev, nuevaRelacion]);
    };

    const actualizarRelacion = (id, campo, valor) => {
        setRelaciones(prev =>
            prev.map(rel =>
                rel.id === id ? { ...rel, [campo]: valor } : rel
            )
        );
    };

    const removerRelacion = (id) => {
        setRelaciones(prev => prev.filter(rel => rel.id !== id));
    };

    const obtenerColumnasParaTabla = (tablaId) => {
        const tabla = tablasSeleccionadas.find(t => t.id === tablaId);
        if (!tabla) return [];

        const key = `${tabla.database}.${tabla.table}`;
        return columnasTablas[key] || [];
    };

    const crearDataWarehouse = async () => {
        if (!nombreDataWarehouse.trim()) {
            document.getElementById('modalDataWarehouseNombreError').showModal();
            return;
        }

        if (tablasSeleccionadas.length === 0) {
            document.getElementById('modalDataWarehouseTablasError').showModal();
            return;
        }

        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const warehouseNameWithSuffix = `${nombreDataWarehouse}_warehouse`;

            const selectedTables = tablasSeleccionadas.map(tabla => ({
                database: tabla.database,
                table: tabla.table,
                alias: tabla.alias
            }));

            const relationships = relaciones.map(rel => {
                const tabla1 = tablasSeleccionadas.find(t => t.id === rel.tabla1Id);
                const tabla2 = tablasSeleccionadas.find(t => t.id === rel.tabla2Id);

                return {
                    table1: {
                        database: tabla1.database,
                        table: tabla1.table,
                        column: rel.tabla1Columna
                    },
                    table2: {
                        database: tabla2.database,
                        table: tabla2.table,
                        column: rel.tabla2Columna
                    },
                    type: rel.tipo
                };
            });

            const requestBody = {
                name: warehouseNameWithSuffix,
                selectedTables,
                relationships
            };

            const response = await fetch('http://localhost:8080/api/datawarehouse/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                let resultado = `=== DATA WAREHOUSE CREADO EXITOSAMENTE ===\n\n`;
                resultado += `Nombre: ${data.warehouseName}\n`;
                resultado += `Mensaje: ${data.message}\n\n`;
                resultado += `TABLAS INCLUIDAS:\n`;
                selectedTables.forEach((tabla, index) => {
                    resultado += `${index + 1}. ${tabla.database}.${tabla.table} (Alias: ${tabla.alias})\n`;
                });

                if (relationships.length > 0) {
                    resultado += `\nRELACIONES DEFINIDAS:\n`;
                    relationships.forEach((rel, index) => {
                        resultado += `${index + 1}. ${rel.table1.database}.${rel.table1.table}.${rel.table1.column} ${rel.type} ${rel.table2.database}.${rel.table2.table}.${rel.table2.column}\n`;
                    });
                }

                textarea.value = resultado;
            }

            setNombreDataWarehouse('');
            setTablasSeleccionadas([]);
            setRelaciones([]);
            document.getElementById('modalCrearDataWarehouse').close();

            document.getElementById('modalDataWarehouseExito').showModal();

        } catch (error) {
            console.error('Error al crear Data Warehouse:', error);
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `Error al crear Data Warehouse: ${error.message}`;
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Card principal con botón */}
            <div className="card w-96 card-md shadow-lg bg-purple-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Crear Data Warehouse</h2>

                    <div className="text-white text-sm opacity-80 h-20">
                        Crea un nuevo Data Warehouse en el que escoges bases de datos combinando tablas de múltiples bases de datos con relaciones personalizadas.
                    </div>

                    <div className="card-actions justify-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                cargarDatabasesYTablas();
                                document.getElementById('modalCrearDataWarehouse').showModal();
                            }}
                        >
                            Crear Data Warehouse
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de creación */}
            <dialog id="modalCrearDataWarehouse" className="modal">
                <div className="modal-box max-w-6xl w-11/12">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg mb-6">Crear Nuevo Data Warehouse</h3>

                    <div className="space-y-6">
                        {/* Nombre del Data Warehouse */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Nombre del Data Warehouse:</span>
                                <span className="label-text-alt text-info">Se agregará "_warehouse"</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre base (ej: ventas, inventario)"
                                className="input input-bordered input-primary w-full"
                                value={nombreDataWarehouse}
                                onChange={(e) => setNombreDataWarehouse(e.target.value)}
                            />
                            {nombreDataWarehouse && (
                                <label className="label">
                                    <span className="label-text-alt">Nombre final: <strong>{nombreDataWarehouse}_warehouse</strong></span>
                                </label>
                            )}
                        </div>

                        {/* Selector de Tablas */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Seleccionar Tablas:</span>
                            </label>

                            {loadingDatabases ? (
                                <div className="flex items-center justify-center p-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                    <span className="ml-3">Cargando bases de datos...</span>
                                </div>
                            ) : (
                                <div className="bg-base-200 p-4 rounded-lg max-h-60 overflow-y-auto">
                                    {databasesTablas.length === 0 ? (
                                        <div className="text-center text-gray-500 p-4">
                                            No se encontraron bases de datos disponibles
                                        </div>
                                    ) : (
                                        databasesTablas.map((db, dbIndex) => (
                                            <div key={dbIndex} className="mb-4">
                                                <h4 className="font-bold text-lg text-primary mb-2">📁 {db.name}</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {db.tables.map((table, tableIndex) => (
                                                        <button
                                                            key={tableIndex}
                                                            className="btn btn-sm btn-outline btn-primary"
                                                            onClick={() => agregarTablaSeleccionada(db.name, table)}
                                                            disabled={tablasSeleccionadas.some(t => t.database === db.name && t.table === table)}
                                                        >
                                                            {table}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tablas Seleccionadas */}
                        {tablasSeleccionadas.length > 0 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Tablas Seleccionadas ({tablasSeleccionadas.length}):</span>
                                </label>
                                <div className="space-y-2 max-h-40 overflow-y-auto bg-base-200 p-3 rounded-lg">
                                    {tablasSeleccionadas.map((tabla) => (
                                        <div key={tabla.id} className="flex items-center gap-2 bg-base-100 p-2 rounded">
                                            <span className="text-sm font-medium min-w-0 flex-shrink-0">{tabla.database}.{tabla.table}</span>
                                            <input
                                                type="text"
                                                placeholder="Alias"
                                                className="input input-xs input-bordered flex-1"
                                                value={tabla.alias}
                                                onChange={(e) => actualizarAlias(tabla.id, e.target.value)}
                                            />
                                            <button
                                                className="btn btn-xs btn-error"
                                                onClick={() => removerTablaSeleccionada(tabla.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Relaciones */}
                        {tablasSeleccionadas.length >= 2 && (
                            <div className="form-control">
                                <div className="flex justify-between items-center">
                                    <label className="label">
                                        <span className="label-text font-semibold">Relaciones entre Tablas:</span>
                                    </label>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={agregarRelacion}
                                        type="button"
                                    >
                                        + Agregar Relación
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-60 overflow-y-auto bg-base-200 p-3 rounded-lg">
                                    {relaciones.map((relacion) => {
                                        const columnas1 = obtenerColumnasParaTabla(relacion.tabla1Id);
                                        const columnas2 = obtenerColumnasParaTabla(relacion.tabla2Id);

                                        return (
                                            <div key={relacion.id} className="bg-base-100 p-3 rounded grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                                                {/* Tabla 1 */}
                                                <select
                                                    className="select select-xs select-bordered"
                                                    value={relacion.tabla1Id}
                                                    onChange={(e) => actualizarRelacion(relacion.id, 'tabla1Id', parseInt(e.target.value))}
                                                >
                                                    {tablasSeleccionadas.map(tabla => (
                                                        <option key={tabla.id} value={tabla.id}>
                                                            {tabla.alias}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Columna 1 */}
                                                <select
                                                    className="select select-xs select-bordered"
                                                    value={relacion.tabla1Columna}
                                                    onChange={(e) => actualizarRelacion(relacion.id, 'tabla1Columna', e.target.value)}
                                                >
                                                    <option value="">Columna...</option>
                                                    {columnas1.map(col => (
                                                        <option key={col.name} value={col.name}>
                                                            {col.name} ({col.type})
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Tipo de relación */}
                                                <select
                                                    className="select select-xs select-bordered"
                                                    value={relacion.tipo}
                                                    onChange={(e) => actualizarRelacion(relacion.id, 'tipo', e.target.value)}
                                                >
                                                    <option value="INNER_JOIN">INNER JOIN</option>
                                                    <option value="LEFT_JOIN">LEFT JOIN</option>
                                                    <option value="RIGHT_JOIN">RIGHT JOIN</option>
                                                    <option value="FULL_JOIN">FULL JOIN</option>
                                                </select>

                                                {/* Tabla 2 */}
                                                <select
                                                    className="select select-xs select-bordered"
                                                    value={relacion.tabla2Id}
                                                    onChange={(e) => actualizarRelacion(relacion.id, 'tabla2Id', parseInt(e.target.value))}
                                                >
                                                    {tablasSeleccionadas.map(tabla => (
                                                        <option key={tabla.id} value={tabla.id}>
                                                            {tabla.alias}
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Columna 2 */}
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        className="select select-xs select-bordered flex-1"
                                                        value={relacion.tabla2Columna}
                                                        onChange={(e) => actualizarRelacion(relacion.id, 'tabla2Columna', e.target.value)}
                                                    >
                                                        <option value="">Columna...</option>
                                                        {columnas2.map(col => (
                                                            <option key={col.name} value={col.name}>
                                                                {col.name} ({col.type})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn btn-xs btn-error"
                                                        onClick={() => removerRelacion(relacion.id)}
                                                        type="button"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Botones del modal */}
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => document.getElementById('modalCrearDataWarehouse').close()}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={crearDataWarehouse}
                                disabled={isLoading || !nombreDataWarehouse.trim() || tablasSeleccionadas.length === 0}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creando...
                                    </>
                                ) : (
                                    'Crear Data Warehouse'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>

            {/* Modales de Error */}
            <dialog id="modalDataWarehouseError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">No se pudieron cargar las bases de datos y tablas.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataWarehouseError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataWarehouseNombreError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, ingresa un nombre para el Data Warehouse.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataWarehouseNombreError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataWarehouseTablasError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona al menos una tabla para el Data Warehouse.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataWarehouseTablasError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataWarehouseExito" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-green-600">✅ Éxito</h3>
                    <p className="py-4">Data Warehouse creado exitosamente.</p>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={() => document.getElementById('modalDataWarehouseExito').close()}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
