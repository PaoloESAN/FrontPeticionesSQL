import React, { useState, useEffect } from 'react';

export default function CrearDataMartCard({ onMostrarEnTextarea }) {
    const [dataWarehouses, setDataWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [warehouseColumns, setWarehouseColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [dataMartName, setDataMartName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingWarehouses, setLoadingWarehouses] = useState(false);
    const [loadingColumns, setLoadingColumns] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        console.log('Componente CrearDataMartCard montado - Iniciando carga inicial');
        cargarDataWarehouses();
    }, []);

    // Cargar lista de Data Warehouses disponibles
    const cargarDataWarehouses = async () => {
        console.log('Iniciando carga de Data Warehouses...');
        setLoadingWarehouses(true);
        try {
            const url = 'http://localhost:8080/api/datawarehouse/list';
            console.log('Petición a:', url);

            const response = await fetch(url);
            console.log('Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Data Warehouses recibidos:', data);
            console.log('Estructura completa de la respuesta:', JSON.stringify(data, null, 2));
            console.log('Número de warehouses:', data.warehouses?.length || 0);

            if (data.warehouses && data.warehouses.length > 0) {
                console.log('Warehouses encontrados:');
                data.warehouses.forEach((warehouse, index) => {
                    console.log(`  ${index + 1}. ${warehouse.name || warehouse}`);
                });
            } else {
                console.warn('No se encontraron Data Warehouses en la respuesta del servidor');
            }

            setDataWarehouses(data.warehouses || []);
            console.log('Data Warehouses cargados exitosamente en estado');
        } catch (error) {
            console.error('Error al cargar Data Warehouses:', error);
            document.getElementById('modalDataMartWarehousesError').showModal();
        } finally {
            setLoadingWarehouses(false);
            console.log('Finalizó carga de Data Warehouses');
        }
    };

    // Cargar columnas del Data Warehouse seleccionado
    const cargarColumnasWarehouse = async (warehouseName) => {
        console.log('=== INICIANDO CARGA DE COLUMNAS ===');
        console.log('Warehouse seleccionado:', warehouseName);

        if (!warehouseName || warehouseName.trim() === '') {
            console.warn('Nombre de warehouse vacío o inválido');
            return;
        }

        setLoadingColumns(true);
        setWarehouseColumns([]);
        setSelectedColumns([]);

        try {
            // Encodificar el nombre del warehouse para la URL
            const encodedWarehouseName = encodeURIComponent(warehouseName);
            const url = `http://localhost:8080/api/datawarehouse/columns?name=${encodedWarehouseName}`;
            console.log('URL construida:', url);
            console.log('Warehouse original:', warehouseName);
            console.log('Warehouse codificado:', encodedWarehouseName);

            console.log('Realizando petición fetch...');
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta recibida:');
            console.log('- Status:', response.status);
            console.log('- Status Text:', response.statusText);
            console.log('- OK:', response.ok);
            console.log('- Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del servidor:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}. Respuesta: ${errorText}`);
            }

            const responseText = await response.text();
            console.log('Respuesta como texto:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                console.log('JSON parseado exitosamente');
            } catch (parseError) {
                console.error('Error al parsear JSON:', parseError);
                console.error('Respuesta original:', responseText);
                throw new Error('La respuesta del servidor no es un JSON válido');
            }

            console.log('Datos de columnas recibidos:', data);
            console.log('Estructura completa de la respuesta:', JSON.stringify(data, null, 2));
            console.log('Tipo de data.columns:', typeof data.columns);
            console.log('Es array data.columns:', Array.isArray(data.columns));
            console.log('Número de columnas:', data.columns?.length || 0);

            if (data.columns && Array.isArray(data.columns) && data.columns.length > 0) {
                console.log('Columnas encontradas:');
                data.columns.forEach((col, index) => {
                    console.log(`  ${index + 1}. ${col.table || 'sin tabla'}.${col.name || 'sin nombre'} (${col.type || 'sin tipo'}) - PK: ${col.primaryKey || false}, Nullable: ${col.nullable !== false}`);
                });

                // Validar estructura de cada columna
                const validColumns = data.columns.filter(col => col.name && col.type);
                if (validColumns.length !== data.columns.length) {
                    console.warn(`Algunas columnas tienen estructura inválida. Válidas: ${validColumns.length}/${data.columns.length}`);
                }

                setWarehouseColumns(validColumns);
                console.log(`${validColumns.length} columnas válidas cargadas en estado`);
            } else {
                console.warn('No se encontraron columnas válidas en la respuesta del servidor');
                console.warn('Estructura de data:', data);
                setWarehouseColumns([]);

                // Si no hay columnas, mostrar un mensaje específico
                if (data.columns && Array.isArray(data.columns) && data.columns.length === 0) {
                    console.warn('El Data Warehouse existe pero no tiene columnas');
                } else if (!data.columns) {
                    console.warn('La respuesta no contiene el campo columns');
                } else {
                    console.warn('El campo columns no es un array válido');
                }
            }

        } catch (error) {
            console.error('=== ERROR AL CARGAR COLUMNAS ===');
            console.error('Error:', error);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            console.error('Warehouse que falló:', warehouseName);

            // Mostrar el modal de error con información más detallada
            setWarehouseColumns([]);
            document.getElementById('modalDataMartColumnsError').showModal();
        } finally {
            setLoadingColumns(false);
            console.log('=== FINALIZÓ CARGA DE COLUMNAS ===');
            console.log('Loading state establecido a false');
        }
    };

    // Manejar selección de Data Warehouse
    const handleWarehouseChange = (warehouseName) => {
        console.log('=== CAMBIO DE WAREHOUSE ===');
        console.log('Warehouse seleccionado:', warehouseName);
        console.log('Warehouse anterior:', selectedWarehouse);

        setSelectedWarehouse(warehouseName);

        if (warehouseName && warehouseName.trim() !== '') {
            console.log('Iniciando carga de columnas para:', warehouseName);
            cargarColumnasWarehouse(warehouseName);
        } else {
            console.log('Warehouse vacío, limpiando columnas');
            setWarehouseColumns([]);
            setSelectedColumns([]);
        }
    };

    // Toggle selección de columna
    const toggleColumnSelection = (column) => {
        console.log('Toggle columna:', column);
        console.log('Estructura de la columna:', JSON.stringify(column, null, 2));

        setSelectedColumns(prev => {
            const exists = prev.find(col => col.name === column.name);
            if (exists) {
                console.log('Removiendo columna:', column.name);
                const updated = prev.filter(col => col.name !== column.name);
                console.log('Columnas seleccionadas después de remover:', updated.length);
                return updated;
            } else {
                console.log('Agregando columna:', column.name);
                const newColumn = { ...column, alias: column.name };
                console.log('Nueva columna con alias:', newColumn);
                const updated = [...prev, newColumn];
                console.log('Columnas seleccionadas después de agregar:', updated.length);
                return updated;
            }
        });
    };

    // Actualizar alias de columna
    const updateColumnAlias = (columnName, newAlias) => {
        setSelectedColumns(prev =>
            prev.map(col =>
                col.name === columnName ? { ...col, alias: newAlias } : col
            )
        );
    };

    // Crear Data Mart
    const crearDataMart = async () => {
        console.log('=== INICIANDO CREACIÓN DE DATA MART ===');

        if (!dataMartName.trim()) {
            console.log('Error: Nombre del Data Mart vacío');
            document.getElementById('modalDataMartNombreError').showModal();
            return;
        }

        if (!selectedWarehouse) {
            console.log('Error: No hay Data Warehouse seleccionado');
            document.getElementById('modalDataMartWarehouseError').showModal();
            return;
        }

        if (selectedColumns.length === 0) {
            console.log('Error: No hay columnas seleccionadas');
            document.getElementById('modalDataMartColumnasError').showModal();
            return;
        }

        console.log('Validaciones pasadas');
        console.log('Estado actual:');
        console.log('- Nombre Data Mart:', dataMartName);
        console.log('- Warehouse origen:', selectedWarehouse);
        console.log('- Columnas seleccionadas:', selectedColumns.length);

        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const requestBody = {
                name: dataMartName,
                sourceWarehouse: selectedWarehouse,
                selectedColumns: selectedColumns.map(col => ({
                    name: col.name,
                    type: col.type,
                    alias: col.alias,
                    table: col.table, // Incluir la tabla de origen
                    primaryKey: col.primaryKey,
                    nullable: col.nullable
                }))
            };

            console.log('Estructura del request body:');
            console.log(JSON.stringify(requestBody, null, 2));
            console.log('Columnas a enviar al backend:');
            selectedColumns.forEach((col, index) => {
                console.log(`  ${index + 1}. ${col.table}.${col.name} AS ${col.alias} (${col.type})`);
            });

            console.log('Enviando request al backend...');
            const response = await fetch('http://localhost:8080/api/datamart/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Respuesta recibida del backend:');
            console.log('- Status:', response.status);
            console.log('- Status Text:', response.statusText);
            console.log('- OK:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error del backend:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}. Detalles: ${errorText}`);
            }

            const data = await response.json();
            console.log('Datos de respuesta del backend:');
            console.log(JSON.stringify(data, null, 2));

            console.log('Data Mart creado exitosamente!');

            // Mostrar resultado en textarea
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                let resultado = `=== DATA MART CREADO EXITOSAMENTE ===\n\n`;
                resultado += `Nombre: ${data.dataMartName || dataMartName}\n`;
                resultado += `Data Warehouse origen: ${selectedWarehouse}\n`;
                resultado += `Mensaje del backend: ${data.message || 'Sin mensaje específico'}\n\n`;

                resultado += `COLUMNAS SELECCIONADAS (${selectedColumns.length}):\n`;
                selectedColumns.forEach((col, index) => {
                    resultado += `${index + 1}. ${col.table ? `${col.table}.` : ''}${col.name} AS ${col.alias} (${col.type})`;
                    if (col.primaryKey) resultado += ` [PK]`;
                    if (!col.nullable) resultado += ` [NOT NULL]`;
                    resultado += `\n`;
                });

                if (data.sql) {
                    resultado += `\nSQL EJECUTADO:\n${data.sql}\n`;
                }

                if (data.details) {
                    resultado += `\nDETALLES ADICIONALES:\n${JSON.stringify(data.details, null, 2)}\n`;
                }

                textarea.value = resultado;
                console.log('Resultado mostrado en textarea');
            }

            // Limpiar formulario
            console.log('Limpiando formulario...');
            setDataMartName('');
            setSelectedWarehouse('');
            setWarehouseColumns([]);
            setSelectedColumns([]);

            console.log('Cerrando modal de creación...');
            document.getElementById('modalCrearDataMart').close();

            // Emitir evento para notificar a otros componentes
            console.log('Emitiendo evento dataMartCreated');
            window.dispatchEvent(new CustomEvent('dataMartCreated', {
                detail: {
                    createdDataMart: dataMartName,
                    sourceWarehouse: selectedWarehouse,
                    columnCount: selectedColumns.length
                }
            }));

            console.log('Mostrando modal de éxito...');
            document.getElementById('modalDataMartExito').showModal();

        } catch (error) {
            console.error('ERROR en creación de Data Mart:');
            console.error('- Mensaje:', error.message);
            console.error('- Error completo:', error);

            let errorMessage = `${error.message}\n\n`;
            errorMessage += `CONFIGURACIÓN INTENTADA:\n`;
            errorMessage += `• Nombre Data Mart: ${dataMartName}\n`;
            errorMessage += `• Warehouse origen: ${selectedWarehouse}\n`;
            errorMessage += `• Columnas seleccionadas: ${selectedColumns.length}`;

            setErrorMessage(errorMessage);

            // Mostrar en textarea como respaldo
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `ERROR AL CREAR DATA MART\n\n${errorMessage}`;
            }

            // Emitir evento para actualizar listas incluso en caso de error
            console.log('Emitiendo evento dataMartCreated para actualizar listas tras error');
            window.dispatchEvent(new CustomEvent('dataMartCreated', {
                detail: {
                    error: true,
                    errorMessage: error.message,
                    attemptedDataMart: dataMartName
                }
            }));

            console.log('Cerrando modal de creación...');
            document.getElementById('modalCrearDataMart').close();

            console.log('Mostrando modal de error...');
            document.getElementById('modalCrearDataMartError').showModal();
        } finally {
            console.log('Finalizando proceso de creación...');
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Card principal */}
            <div className="card w-96 card-md shadow-lg bg-orange-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Crear Data Mart</h2>

                    <div className="text-white text-sm opacity-80 h-20">
                        Crea un nuevo Data Mart seleccionando un Data Warehouse existente y especificando qué columnas incluir en la nueva tabla optimizada.
                    </div>

                    <div className="card-actions justify-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                cargarDataWarehouses();
                                document.getElementById('modalCrearDataMart').showModal();
                            }}
                        >
                            Crear Data Mart
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de creación */}
            <dialog id="modalCrearDataMart" className="modal">
                <div className="modal-box max-w-4xl w-11/12">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>

                    <h3 className="font-bold text-lg mb-6">Crear Nuevo Data Mart</h3>

                    <div className="space-y-6">
                        {/* Selector de Data Warehouse */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Seleccionar Data Warehouse:</span>
                            </label>

                            {loadingWarehouses ? (
                                <div className="flex items-center justify-center p-4">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <span className="ml-3">Cargando Data Warehouses...</span>
                                </div>
                            ) : (
                                <select
                                    className="select select-bordered select-primary w-full"
                                    value={selectedWarehouse}
                                    onChange={(e) => handleWarehouseChange(e.target.value)}
                                >
                                    <option value="">Selecciona un Data Warehouse...</option>
                                    {dataWarehouses.map((warehouse, index) => (
                                        <option key={index} value={warehouse.name}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Nombre del Data Mart - Solo aparece cuando se selecciona un warehouse */}
                        {selectedWarehouse && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Nombre del Data Mart:</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ingresa el nombre del Data Mart (ej: ventas_trimestre, productos_activos)"
                                    className="input input-bordered input-secondary w-full"
                                    value={dataMartName}
                                    onChange={(e) => setDataMartName(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Tabla principal del Data Warehouse y selección de columnas */}
                        {selectedWarehouse && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">
                                        Tabla Principal de "{selectedWarehouse}":
                                    </span>
                                    <span className="label-text-alt text-info">
                                        Columnas seleccionadas: {selectedColumns.length}
                                    </span>
                                </label>

                                {loadingColumns ? (
                                    <div className="flex items-center justify-center p-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                        <span className="ml-3">Cargando columnas...</span>
                                    </div>
                                ) : (
                                    <div className="bg-base-200 p-4 rounded-lg max-h-80 overflow-y-auto">
                                        {warehouseColumns.length === 0 ? (
                                            <div className="text-center p-6">
                                                <div className="text-gray-500 mb-2">
                                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m-2 0v5a2 2 0 002 2h2m8-2h2a2 2 0 002-2v-5m0 0h-2m-2 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4z" />
                                                    </svg>
                                                    No se encontraron columnas
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    El Data Warehouse "<strong>{selectedWarehouse}</strong>" no tiene columnas disponibles.
                                                </p>
                                                <div className="text-xs text-gray-500">
                                                    <p>Posibles causas:</p>
                                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                                        <li>El Data Warehouse está vacío</li>
                                                        <li>Error de conectividad con el servidor</li>
                                                        <li>El Data Warehouse fue eliminado recientemente</li>
                                                    </ul>
                                                </div>
                                                <button
                                                    className="btn btn-sm btn-outline btn-primary mt-4"
                                                    onClick={() => cargarColumnasWarehouse(selectedWarehouse)}
                                                >
                                                    Reintentar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {warehouseColumns.map((column, index) => {
                                                    const isSelected = selectedColumns.some(col => col.name === column.name);

                                                    return (
                                                        <label key={index} className="cursor-pointer">
                                                            <div className={`flex items-center gap-3 p-3 rounded border ${isSelected ? 'bg-primary/10 border-primary' : 'border-base-300'
                                                                }`}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleColumnSelection(column)}
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{column.name}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {column.type}
                                                                        {column.table && ` • Tabla: ${column.table}`}
                                                                        {column.primaryKey && ' • PK'}
                                                                        {!column.nullable && ' • NOT NULL'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Alias de columnas seleccionadas */}
                        {selectedColumns.length > 0 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Alias para Columnas Seleccionadas:</span>
                                </label>
                                <div className="bg-base-200 p-4 rounded-lg max-h-60 overflow-y-auto space-y-2">
                                    {selectedColumns.map((column, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-base-100 p-2 rounded">
                                            <span className="text-sm font-medium min-w-0 flex-shrink-0 w-32">
                                                {column.name}:
                                            </span>
                                            <input
                                                type="text"
                                                className="input input-sm input-bordered flex-1"
                                                value={column.alias}
                                                onChange={(e) => updateColumnAlias(column.name, e.target.value)}
                                                placeholder="Alias de la columna"
                                            />
                                            <span className="text-xs text-gray-500 w-20">
                                                {column.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Botones del modal */}
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => {
                                    document.getElementById('modalCrearDataMart').close();
                                    // Limpiar estado al cancelar
                                    setDataMartName('');
                                    setSelectedWarehouse('');
                                    setWarehouseColumns([]);
                                    setSelectedColumns([]);
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={crearDataMart}
                                disabled={
                                    isLoading ||
                                    !dataMartName.trim() ||
                                    !selectedWarehouse ||
                                    selectedColumns.length === 0
                                }
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creando...
                                    </>
                                ) : (
                                    'Crear Data Mart'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>

            {/* Modales de Error */}
            <dialog id="modalDataMartWarehousesError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">Error</h3>
                    <p className="py-4">No se pudieron cargar los Data Warehouses disponibles.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataMartWarehousesError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataMartColumnsError" className="modal">
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg text-red-600">Error al Cargar Columnas</h3>
                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 font-semibold mb-2">No se pudieron cargar las columnas del Data Warehouse seleccionado.</p>
                            <div className="text-sm text-red-700">
                                <p className="mb-2"><strong>Posibles causas:</strong></p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>El Data Warehouse seleccionado no existe o fue eliminado</li>
                                    <li>El Data Warehouse no tiene ninguna tabla o columna</li>
                                    <li>Error de conectividad con el servidor backend</li>
                                    <li>El endpoint /api/datawarehouse/columns no está disponible</li>
                                    <li>Problemas de permisos en el servidor</li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="mb-2"><strong>Pasos para resolver:</strong></p>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                                <li>Verifica que el Data Warehouse existe ejecutando "Listar Data Warehouses"</li>
                                <li>Comprueba la consola del navegador (F12) para más detalles del error</li>
                                <li>Verifica que el backend esté funcionando correctamente</li>
                                <li>Asegúrate de que el endpoint GET /api/datawarehouse/columns?name=X existe</li>
                            </ol>
                            <p className="mt-3 text-xs bg-gray-100 p-2 rounded">
                                <strong>URL esperada:</strong> http://localhost:8080/api/datawarehouse/columns?name=NOMBRE_WAREHOUSE
                            </p>
                        </div>
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={() => document.getElementById('modalDataMartColumnsError').close()}>
                            Entendido
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataMartNombreError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">Error</h3>
                    <p className="py-4">Por favor, ingresa un nombre para el Data Mart.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataMartNombreError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataMartWarehouseError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">Error</h3>
                    <p className="py-4">Por favor, selecciona un Data Warehouse.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataMartWarehouseError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataMartColumnasError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">Error</h3>
                    <p className="py-4">Por favor, selecciona al menos una columna para el Data Mart.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataMartColumnasError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataMartExito" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-green-600">Éxito</h3>
                    <p className="py-4">Data Mart creado exitosamente.</p>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={() => document.getElementById('modalDataMartExito').close()}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error de Creación */}
            <dialog id="modalCrearDataMartError" className="modal">
                <div className="modal-box max-w-2xl">
                    <h3 className="font-bold text-lg text-red-600">Error al Crear Data Mart</h3>
                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 font-semibold mb-2">Ha ocurrido un error durante la creación del Data Mart:</p>
                            <pre className="text-sm text-red-700 whitespace-pre-wrap bg-red-100 p-3 rounded overflow-auto max-h-60">
                                {errorMessage}
                            </pre>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p className="mb-2"><strong>Posibles causas:</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>El Data Warehouse origen no existe o no está accesible</li>
                                <li>Las columnas seleccionadas no son válidas</li>
                                <li>El nombre del Data Mart ya existe</li>
                                <li>Error de conexión con la base de datos</li>
                                <li>Problemas de permisos en el servidor</li>
                            </ul>
                            <p className="mt-3">
                                <strong>Sugerencia:</strong> Revisa la configuración y vuelve a intentarlo.
                                Si el problema persiste, verifica los logs del backend.
                            </p>
                        </div>
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                document.getElementById('modalCrearDataMartError').close();
                                setErrorMessage('');
                            }}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
