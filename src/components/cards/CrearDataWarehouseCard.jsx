import React, { useState, useEffect } from 'react';

export default function CrearDataWarehouseCard({ onMostrarEnTextarea }) {
    const [nombreDataWarehouse, setNombreDataWarehouse] = useState('');
    const [nombreTablaWarehouse, setNombreTablaWarehouse] = useState('');
    const [databasesTablas, setDatabasesTablas] = useState([]);
    const [tablasSeleccionadas, setTablasSeleccionadas] = useState([]);
    const [columnasSeleccionadas, setColumnasSeleccionadas] = useState([]);
    const [relaciones, setRelaciones] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDatabases, setLoadingDatabases] = useState(false);
    const [columnasTablas, setColumnasTablas] = useState({});

    useEffect(() => {
        console.log('🚀 Componente CrearDataWarehouseCard montado - Iniciando carga inicial');
        cargarDatabasesYTablas();
    }, []);

    const cargarDatabasesYTablas = async () => {
        console.log('🗄️ Iniciando carga de bases de datos y tablas...');
        setLoadingDatabases(true);
        try {
            const url = 'http://localhost:8080/api/datawarehouse/databases-tables';
            console.log('🌐 Petición a:', url);

            const response = await fetch(url);
            console.log('📡 Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🗄️ Datos recibidos:', data);
            console.log('📊 Número de bases de datos:', data.databases?.length || 0);

            if (data.databases && data.databases.length > 0) {
                data.databases.forEach((db, index) => {
                    console.log(`  ${index + 1}. ${db.name} (${db.tables?.length || 0} tablas)`);
                });
            }

            setDatabasesTablas(data.databases || []);
            console.log('✅ Bases de datos y tablas cargadas exitosamente');
        } catch (error) {
            console.error('❌ Error al cargar databases y tablas:', error);
            document.getElementById('modalDataWarehouseError').showModal();
        } finally {
            setLoadingDatabases(false);
            console.log('🏁 Finalizó carga de bases de datos');
        }
    };

    const cargarColumnasTabla = async (database, table) => {
        console.log('📊 Cargando columnas para tabla:', { database, table });
        const key = `${database}.${table}`;

        if (columnasTablas[key]) {
            console.log('💾 Columnas ya cargadas en cache para:', key);
            return;
        }

        try {
            const url = `http://localhost:8080/api/datawarehouse/table-columns?database=${database}&table=${table}`;
            console.log('🌐 Petición a:', url);

            const response = await fetch(url);
            console.log('📡 Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📊 Datos de columnas recibidos:', data);
            console.log('🔢 Número de columnas:', data.columns?.length || 0);

            setColumnasTablas(prev => {
                const updated = {
                    ...prev,
                    [key]: data.columns || []
                };
                console.log('💾 Cache de columnas actualizado:', Object.keys(updated));
                return updated;
            });
        } catch (error) {
            console.error('❌ Error al cargar columnas para', key, ':', error);
        }
    };

    const agregarTablaSeleccionada = (database, table) => {
        console.log('➕ Agregando tabla seleccionada:', { database, table });
        const id = Date.now();
        const nuevaTabla = {
            id,
            database,
            table,
            alias: `${table}_${database}`
        };
        console.log('📋 Nueva tabla creada:', nuevaTabla);
        setTablasSeleccionadas(prev => {
            const updated = [...prev, nuevaTabla];
            console.log('📊 Tablas seleccionadas actualizadas:', updated);
            return updated;
        });
        cargarColumnasTabla(database, table);
    };

    const removerTablaSeleccionada = (id) => {
        console.log('🗑️ Removiendo tabla seleccionada con ID:', id);
        const tablaARemover = tablasSeleccionadas.find(t => t.id === id);
        console.log('📋 Tabla a remover:', tablaARemover);

        setTablasSeleccionadas(prev => {
            const updated = prev.filter(tabla => tabla.id !== id);
            console.log('📊 Tablas restantes:', updated);
            return updated;
        });

        setColumnasSeleccionadas(prev => {
            const updated = prev.filter(col => col.tablaId !== id);
            console.log('🔄 Columnas actualizadas tras remover tabla:', updated);
            return updated;
        });

        setRelaciones(prev => {
            const updated = prev.filter(rel => rel.tabla1Id !== id && rel.tabla2Id !== id);
            console.log('🔗 Relaciones actualizadas tras remover tabla:', updated);
            return updated;
        });
    };

    const actualizarAlias = (id, nuevoAlias) => {
        setTablasSeleccionadas(prev =>
            prev.map(tabla =>
                tabla.id === id ? { ...tabla, alias: nuevoAlias } : tabla
            )
        );
    };

    const agregarRelacion = () => {
        console.log('🔗 Agregando nueva relación...');
        if (tablasSeleccionadas.length < 2) {
            console.warn('⚠️ No hay suficientes tablas para crear relación (mínimo 2)');
            return;
        }

        const nuevaRelacion = {
            id: Date.now(),
            tabla1Id: tablasSeleccionadas[0].id,
            tabla1Columna: '',
            tabla2Id: tablasSeleccionadas[1].id,
            tabla2Columna: '',
            tipo: 'INNER JOIN'
        };

        console.log('🔗 Nueva relación creada:', nuevaRelacion);
        setRelaciones(prev => {
            const updated = [...prev, nuevaRelacion];
            console.log('📊 Total de relaciones:', updated.length);
            return updated;
        });
    };

    const actualizarRelacion = (id, campo, valor) => {
        console.log(`🔄 Actualizando relación ${id}: ${campo} = ${valor}`);
        setRelaciones(prev =>
            prev.map(rel =>
                rel.id === id ? { ...rel, [campo]: valor } : rel
            )
        );
    };

    const removerRelacion = (id) => {
        console.log('🗑️ Removiendo relación con ID:', id);
        setRelaciones(prev => {
            const updated = prev.filter(rel => rel.id !== id);
            console.log('📊 Relaciones restantes:', updated.length);
            return updated;
        });
    };

    const toggleColumnaSeleccionada = (tablaId, columna) => {
        const tabla = tablasSeleccionadas.find(t => t.id === tablaId);
        if (!tabla) {
            console.warn('⚠️ No se encontró tabla con ID:', tablaId);
            return;
        }

        const columnaCompleta = {
            id: `${tablaId}_${columna.name}`,
            tablaId,
            nombre: columna.name,
            tipo: columna.type,
            alias: `${tabla.alias}_${columna.name}`,
            database: tabla.database,
            table: tabla.table
        };

        console.log('🔄 Toggle columna:', columnaCompleta);

        setColumnasSeleccionadas(prev => {
            const exists = prev.find(col => col.id === columnaCompleta.id);
            if (exists) {
                console.log('➖ Removiendo columna:', columnaCompleta.nombre);
                return prev.filter(col => col.id !== columnaCompleta.id);
            } else {
                console.log('➕ Agregando columna:', columnaCompleta.nombre);
                return [...prev, columnaCompleta];
            }
        });
    };

    const actualizarAliasColumna = (columnaId, nuevoAlias) => {
        setColumnasSeleccionadas(prev =>
            prev.map(col =>
                col.id === columnaId ? { ...col, alias: nuevoAlias } : col
            )
        );
    };

    const obtenerColumnasParaTabla = (tablaId) => {
        const tabla = tablasSeleccionadas.find(t => t.id === tablaId);
        if (!tabla) return [];

        const key = `${tabla.database}.${tabla.table}`;
        return columnasTablas[key] || [];
    };

    const crearDataWarehouse = async () => {
        console.log('=== INICIANDO CREACIÓN DE DATA WAREHOUSE ===');

        if (!nombreDataWarehouse.trim()) {
            console.log('❌ Error: Nombre del Data Warehouse vacío');
            document.getElementById('modalDataWarehouseNombreError').showModal();
            return;
        }

        if (!nombreTablaWarehouse.trim()) {
            console.log('❌ Error: Nombre de tabla principal vacío');
            document.getElementById('modalDataWarehouseTablaNombreError').showModal();
            return;
        }

        if (tablasSeleccionadas.length === 0) {
            console.log('❌ Error: No hay tablas seleccionadas');
            document.getElementById('modalDataWarehouseTablasError').showModal();
            return;
        }

        if (columnasSeleccionadas.length === 0) {
            console.log('❌ Error: No hay columnas seleccionadas');
            document.getElementById('modalDataWarehouseColumnasError').showModal();
            return;
        }

        console.log('✅ Validaciones iniciales pasadas');
        console.log('📊 Estado actual:');
        console.log('- Nombre DW:', nombreDataWarehouse);
        console.log('- Nombre tabla:', nombreTablaWarehouse);
        console.log('- Tablas seleccionadas:', tablasSeleccionadas.length);
        console.log('- Columnas seleccionadas:', columnasSeleccionadas.length);
        console.log('- Relaciones definidas:', relaciones.length);

        if (onMostrarEnTextarea) {
            await onMostrarEnTextarea();
        }

        setIsLoading(true);

        try {
            const warehouseNameWithSuffix = `${nombreDataWarehouse}_warehouse`;
            console.log('🏗️ Nombre final del Data Warehouse:', warehouseNameWithSuffix);

            // Mapear tablas seleccionadas
            const selectedTables = tablasSeleccionadas.map(tabla => ({
                database: tabla.database,
                table: tabla.table,
                alias: tabla.alias
            }));
            console.log('📋 Tablas mapeadas para envío:', selectedTables);

            // Mapear relaciones
            console.log('🔗 Procesando relaciones...');
            const relationships = relaciones.map((rel, index) => {
                console.log(`  Relación ${index + 1}:`);
                console.log(`    - tabla1Id: ${rel.tabla1Id}, tabla2Id: ${rel.tabla2Id}`);
                console.log(`    - tipo: ${rel.tipo}`);
                console.log(`    - columna1: ${rel.tabla1Columna}, columna2: ${rel.tabla2Columna}`);

                const tabla1 = tablasSeleccionadas.find(t => t.id === rel.tabla1Id);
                const tabla2 = tablasSeleccionadas.find(t => t.id === rel.tabla2Id);

                if (!tabla1) {
                    console.warn(`⚠️ No se encontró tabla1 con ID ${rel.tabla1Id}`);
                }
                if (!tabla2) {
                    console.warn(`⚠️ No se encontró tabla2 con ID ${rel.tabla2Id}`);
                }

                const relationship = {
                    table1: {
                        database: tabla1?.database,
                        table: tabla1?.table,
                        column: rel.tabla1Columna
                    },
                    table2: {
                        database: tabla2?.database,
                        table: tabla2?.table,
                        column: rel.tabla2Columna
                    },
                    type: rel.tipo
                };

                console.log(`    ✅ Relación mapeada:`, relationship);
                return relationship;
            });

            // Mapear columnas seleccionadas
            console.log('📊 Procesando columnas seleccionadas...');
            const selectedColumnsForRequest = columnasSeleccionadas.map((col, index) => {
                console.log(`  Columna ${index + 1}: ${col.database}.${col.table}.${col.nombre} AS ${col.alias} (${col.tipo})`);
                return {
                    database: col.database,
                    table: col.table,
                    column: col.nombre,
                    alias: col.alias,
                    type: col.tipo
                };
            });

            const requestBody = {
                name: warehouseNameWithSuffix,
                tableName: nombreTablaWarehouse,
                selectedTables,
                selectedColumns: selectedColumnsForRequest,
                relationships
            };

            console.log('📤 Estructura completa del request body:');
            console.log('===============================================');
            console.log(JSON.stringify(requestBody, null, 2));
            console.log('===============================================');

            // Validaciones adicionales antes del envío
            console.log('🔍 Validaciones finales:');
            console.log('- Todas las relaciones tienen columnas definidas?');
            relationships.forEach((rel, i) => {
                if (!rel.table1.column || !rel.table2.column) {
                    console.warn(`⚠️ Relación ${i + 1} tiene columnas vacías:`, rel);
                } else {
                    console.log(`✅ Relación ${i + 1} OK: ${rel.table1.database}.${rel.table1.table}.${rel.table1.column} ${rel.type} ${rel.table2.database}.${rel.table2.table}.${rel.table2.column}`);
                }
            });

            console.log('- Todas las columnas tienen alias?');
            selectedColumnsForRequest.forEach((col, i) => {
                if (!col.alias.trim()) {
                    console.warn(`⚠️ Columna ${i + 1} no tiene alias:`, col);
                } else {
                    console.log(`✅ Columna ${i + 1} OK: ${col.database}.${col.table}.${col.column} AS ${col.alias}`);
                }
            });

            console.log('🚀 Enviando request al backend...');
            console.log('🌐 URL:', 'http://localhost:8080/api/datawarehouse/create');
            console.log('📨 Método: POST');
            console.log('📝 Headers:', { 'Content-Type': 'application/json' });

            const response = await fetch('http://localhost:8080/api/datawarehouse/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Respuesta recibida del backend:');
            console.log('- Status:', response.status);
            console.log('- Status Text:', response.statusText);
            console.log('- OK:', response.ok);
            console.log('- Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error del backend:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}. Detalles: ${errorText}`);
            }

            const data = await response.json();
            console.log('📊 Datos de respuesta del backend:');
            console.log(JSON.stringify(data, null, 2));

            console.log('✅ Data Warehouse creado exitosamente!');
            console.log('🏗️ Creando mensaje para mostrar en textarea...');

            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                let resultado = `=== DATA WAREHOUSE CREADO EXITOSAMENTE ===\n\n`;
                resultado += `Nombre: ${data.warehouseName || warehouseNameWithSuffix}\n`;
                resultado += `Tabla principal: ${nombreTablaWarehouse}\n`;
                resultado += `Mensaje del backend: ${data.message || 'Sin mensaje específico'}\n\n`;

                resultado += `TABLAS INCLUIDAS (${selectedTables.length}):\n`;
                selectedTables.forEach((tabla, index) => {
                    resultado += `${index + 1}. ${tabla.database}.${tabla.table} (Alias: ${tabla.alias})\n`;
                });

                resultado += `\nCOLUMNAS SELECCIONADAS (${columnasSeleccionadas.length}):\n`;
                columnasSeleccionadas.forEach((col, index) => {
                    resultado += `${index + 1}. ${col.database}.${col.table}.${col.nombre} AS ${col.alias} (${col.tipo})\n`;
                });

                if (relationships.length > 0) {
                    resultado += `\nRELACIONES DEFINIDAS (${relationships.length}):\n`;
                    relationships.forEach((rel, index) => {
                        resultado += `${index + 1}. ${rel.table1.database}.${rel.table1.table}.${rel.table1.column} ${rel.type} ${rel.table2.database}.${rel.table2.table}.${rel.table2.column}\n`;
                    });
                } else {
                    resultado += `\nRELACIONES: Ninguna definida\n`;
                }

                if (data.sql) {
                    resultado += `\nSQL EJECUTADO:\n${data.sql}\n`;
                }

                if (data.details) {
                    resultado += `\nDETALLES ADICIONALES:\n${JSON.stringify(data.details, null, 2)}\n`;
                }

                textarea.value = resultado;
                console.log('📝 Resultado mostrado en textarea:', resultado);
            } else {
                console.warn('⚠️ No se encontró el textarea con ID "resultadoConsulta"');
            }

            console.log('🧹 Limpiando formulario...');
            setNombreDataWarehouse('');
            setNombreTablaWarehouse('');
            setTablasSeleccionadas([]);
            setColumnasSeleccionadas([]);
            setRelaciones([]);

            console.log('🔒 Cerrando modal de creación...');
            document.getElementById('modalCrearDataWarehouse').close();

            console.log('🎉 Mostrando modal de éxito...');
            document.getElementById('modalDataWarehouseExito').showModal();

        } catch (error) {
            console.error('❌ ERROR en creación de Data Warehouse:');
            console.error('- Mensaje:', error.message);
            console.error('- Stack:', error.stack);
            console.error('- Error completo:', error);

            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                let errorMessage = `❌ ERROR AL CREAR DATA WAREHOUSE\n\n`;
                errorMessage += `Mensaje: ${error.message}\n\n`;
                errorMessage += `CONFIGURACIÓN INTENTADA:\n`;
                errorMessage += `- Nombre DW: ${nombreDataWarehouse}_warehouse\n`;
                errorMessage += `- Tabla principal: ${nombreTablaWarehouse}\n`;
                errorMessage += `- Tablas seleccionadas: ${tablasSeleccionadas.length}\n`;
                errorMessage += `- Columnas seleccionadas: ${columnasSeleccionadas.length}\n`;
                errorMessage += `- Relaciones definidas: ${relaciones.length}\n\n`;
                errorMessage += `Hora del error: ${new Date().toLocaleString()}\n`;
                textarea.value = errorMessage;
                console.log('📝 Mensaje de error mostrado en textarea');
            } else {
                console.warn('⚠️ No se encontró el textarea para mostrar el error');
            }

            console.log('⚠️ Mostrando modal de error...');
            // Podrías mostrar un modal de error aquí si tienes uno
        } finally {
            console.log('🏁 Finalizando proceso de creación...');
            setIsLoading(false);
            console.log('💡 Loading state establecido a false');
        }
    };
    return (
        <>
            {/* Card principal con botón */}
            <div className="card w-96 card-md shadow-lg bg-purple-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Crear Data Warehouse</h2>

                    <div className="text-white text-sm opacity-80 h-20">
                        Crea un nuevo Data Warehouse seleccionando tablas de múltiples bases de datos y especificando qué columnas incluir en la tabla consolidada con relaciones personalizadas.
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

                        {/* Nombre de la Tabla */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Nombre de la Tabla Principal:</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre de la tabla (ej: datos_consolidados, vista_general)"
                                className="input input-bordered input-secondary w-full"
                                value={nombreTablaWarehouse}
                                onChange={(e) => setNombreTablaWarehouse(e.target.value)}
                            />
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

                        {/* Selección de Columnas */}
                        {tablasSeleccionadas.length > 0 && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Seleccionar Columnas para la Tabla del Data Warehouse:</span>
                                    <span className="label-text-alt text-info">Columnas seleccionadas: {columnasSeleccionadas.length}</span>
                                </label>
                                <div className="space-y-4 max-h-80 overflow-y-auto bg-base-200 p-4 rounded-lg">
                                    {tablasSeleccionadas.map((tabla) => {
                                        const columnasTabla = obtenerColumnasParaTabla(tabla.id);
                                        const columnasSeleccionadasTabla = columnasSeleccionadas.filter(col => col.tablaId === tabla.id);

                                        return (
                                            <div key={tabla.id} className="bg-base-100 p-3 rounded-lg">
                                                <h5 className="font-bold text-primary mb-2">
                                                    📋 {tabla.database}.{tabla.table} ({tabla.alias})
                                                </h5>

                                                {columnasTabla.length === 0 ? (
                                                    <div className="text-sm text-gray-500 italic">Cargando columnas...</div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {columnasTabla.map((columna) => {
                                                            const isSelected = columnasSeleccionadas.some(col =>
                                                                col.tablaId === tabla.id && col.nombre === columna.name
                                                            );

                                                            return (
                                                                <label key={columna.name} className="cursor-pointer">
                                                                    <div className={`flex items-center gap-2 p-2 rounded border ${isSelected ? 'bg-primary/10 border-primary' : 'border-base-300'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox checkbox-primary checkbox-sm"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleColumnaSeleccionada(tabla.id, columna)}
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-sm font-medium">{columna.name}</div>
                                                                            <div className="text-xs text-gray-500">{columna.type}</div>
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {columnasSeleccionadasTabla.length > 0 && (
                                                    <div className="mt-3">
                                                        <h6 className="text-sm font-semibold mb-2">Alias de columnas seleccionadas:</h6>
                                                        <div className="space-y-1">
                                                            {columnasSeleccionadasTabla.map((col) => (
                                                                <div key={col.id} className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-600 min-w-0 flex-shrink-0">
                                                                        {col.nombre}:
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        className="input input-xs input-bordered flex-1"
                                                                        value={col.alias}
                                                                        onChange={(e) => actualizarAliasColumna(col.id, e.target.value)}
                                                                        placeholder="Alias de la columna"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
                                disabled={isLoading || !nombreDataWarehouse.trim() || !nombreTablaWarehouse.trim() || tablasSeleccionadas.length === 0 || columnasSeleccionadas.length === 0}
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

            <dialog id="modalDataWarehouseTablaNombreError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, ingresa un nombre para la tabla principal del Data Warehouse.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataWarehouseTablaNombreError').close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>

            <dialog id="modalDataWarehouseColumnasError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">❌ Error</h3>
                    <p className="py-4">Por favor, selecciona al menos una columna para incluir en la tabla del Data Warehouse.</p>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById('modalDataWarehouseColumnasError').close()}>
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
