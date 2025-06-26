import React, { useState, useEffect } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import TablaSelector from './TablaSelector';

export default function InsertarDatosCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tablaSeleccionada, setTablaSeleccionada] = useState('');
    const [columnas, setColumnas] = useState([]);
    const [valores, setValores] = useState({});
    const [valoresForaneas, setValoresForaneas] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isInserting, setIsInserting] = useState(false); useEffect(() => {
        const obtenerColumnas = async () => {
            setIsLoading(true);
            try {
                const url = `http://localhost:8080/api/columnas?tabla=${tablaSeleccionada}&bd=${baseDatosSeleccionada}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();                    // Adaptar la estructura de datos según lo que devuelve el endpoint
                    let columnasProcessadas = [];
                    if (Array.isArray(data) && data.length > 0) {
                        // El endpoint ahora devuelve objetos con la estructura completa
                        columnasProcessadas = data.map((columna) => {
                            // La nueva estructura ya viene con todos los campos necesarios
                            return {
                                nombre: columna.nombre,
                                tipo: columna.tipo || 'TEXT',
                                esNulo: columna.esNulo !== undefined ? columna.esNulo : true,
                                esPrimaria: columna.esPrimaria !== undefined ? columna.esPrimaria : false,
                                esForanea: columna.esForanea !== undefined ? columna.esForanea : false,
                                esAutoIncremento: columna.esAutoIncremento !== undefined ? columna.esAutoIncremento : false,
                                tablaReferencia: columna.tablaReferencia || null,
                                columnaReferencia: columna.columnaReferencia || null
                            };
                        });
                    } setColumnas(columnasProcessadas);

                    // Inicializar valores vacíos para cada columna
                    const valoresIniciales = {};
                    columnasProcessadas.forEach(columna => {
                        valoresIniciales[columna.nombre] = '';
                    });
                    setValores(valoresIniciales);
                } else {
                    setColumnas([]);
                }
            } catch {
                setColumnas([]);
            } finally {
                setIsLoading(false);
            }
        }; if (baseDatosSeleccionada && tablaSeleccionada) {
            obtenerColumnas();
        } else {
            setColumnas([]);
            setValores({});
            setValoresForaneas({});
        }
    }, [baseDatosSeleccionada, tablaSeleccionada]);    // Efecto para cargar valores de claves foráneas
    useEffect(() => {
        const cargarValoresForaneas = async () => {
            if (!baseDatosSeleccionada || columnas.length === 0) {
                return;
            }

            const valoresFK = {};

            for (const columna of columnas) {
                if (columna.esForanea && columna.tablaReferencia && columna.columnaReferencia) {
                    try {
                        const url = `http://localhost:8080/api/datos?bd=${baseDatosSeleccionada}&tabla=${columna.tablaReferencia}`;
                        const response = await fetch(url);
                        if (response.ok) {
                            const data = await response.json();
                            // Extraer los valores únicos de la columna referenciada
                            const valoresUnicos = data
                                .map(fila => fila[columna.columnaReferencia])
                                .filter((valor, index, array) => array.indexOf(valor) === index && valor !== null && valor !== undefined)
                                .sort();

                            valoresFK[columna.nombre] = valoresUnicos;
                        }
                    } catch {
                        // Error silencioso al cargar valores FK
                    }
                }
            }

            setValoresForaneas(valoresFK);
        };

        cargarValoresForaneas();
    }, [baseDatosSeleccionada, columnas]);

    const handleOpenModal = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalInsertarDatosErrorBase').showModal();
            return;
        }
        if (!tablaSeleccionada) {
            document.getElementById('modalInsertarDatosErrorTabla').showModal();
            return;
        }
        if (columnas.length === 0) {
            document.getElementById('modalInsertarDatosErrorColumnas').showModal();
            return;
        }
        document.getElementById('modalInsertarDatos').showModal();
    }; const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setTablaSeleccionada('');
        setColumnas([]);
        setValores({});
        setValoresForaneas({});
    };

    const handleTablaChange = (nuevaTabla) => {
        setTablaSeleccionada(nuevaTabla);
        setColumnas([]);
        setValores({});
        setValoresForaneas({});
    };

    return (
        <>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title text-white">Insertar Datos:</h2>

                    {/* Selector de base de datos */}
                    <div className='flex flex-row gap-2 items-center'>
                        <BaseDatosSelector
                            value={baseDatosSeleccionada}
                            onBaseDatosChange={handleBaseDatosChange}
                            placeholder="Selecciona base de datos"
                            className="select select-warning flex-1"
                        />
                    </div>

                    {/* Selector de tabla */}
                    <div className='flex flex-row gap-2 items-center'>
                        <TablaSelector
                            baseDatos={baseDatosSeleccionada}
                            value={tablaSeleccionada}
                            onTablaChange={handleTablaChange}
                            placeholder="Selecciona tabla"
                            className="select select-warning flex-1"
                        />
                    </div>                    {/* Indicador de columnas encontradas */}
                    {tablaSeleccionada && (
                        <div className="text-center">
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm text-white"></span>
                            ) : (
                                <div className="text-white text-sm space-y-1">
                                    <p>
                                        {columnas.length > 0 ? `${columnas.length} columnas encontradas` : 'Sin columnas'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Botón para abrir modal */}
                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-warning"
                            onClick={handleOpenModal}
                            disabled={isInserting || !baseDatosSeleccionada || !tablaSeleccionada || columnas.length === 0}
                        >
                            {isInserting ? 'Insertando...' : 'Insertar Datos'}
                        </button>
                    </div>
                </div>
            </div>            {/* Modal para insertar datos */}
            <ModalInsertarDatos
                baseDatos={baseDatosSeleccionada}
                tabla={tablaSeleccionada}
                columnas={columnas}
                valores={valores}
                setValores={setValores}
                valoresForaneas={valoresForaneas}
                setIsInserting={setIsInserting}
                isLoading={isLoading}
            />

            {/* Modales de error */}
            <ModalInsertarDatosErrores />
        </>
    );
}

// Componente Modal para insertar datos
function ModalInsertarDatos({ baseDatos, tabla, columnas, valores, setValores, valoresForaneas, setIsInserting, isLoading }) {
    const handleValorChange = (nombreColumna, valor) => {
        setValores(prev => ({
            ...prev,
            [nombreColumna]: valor
        }));
    }; const insertarDatos = async () => {
        setIsInserting(true);

        try {
            // Validar campos obligatorios (que no permiten NULL)
            const camposObligatorios = columnas.filter(col => !col.esNulo);
            const camposObligatoriosVacios = camposObligatorios.filter(col =>
                !valores[col.nombre] || valores[col.nombre].trim() === ''
            );

            if (camposObligatoriosVacios.length > 0) {
                const textarea = document.getElementById('resultadoConsulta');
                if (textarea) {
                    textarea.value = `❌ Campos obligatorios faltantes: ${camposObligatoriosVacios.map(c => c.nombre).join(', ')}`;
                }
                document.getElementById('modalInsertarDatosErrorValores').showModal();
                setIsInserting(false);
                return;
            }

            const valoresNoVacios = Object.entries(valores).filter(([key, value]) => {
                const columna = columnas.find(col => col.nombre === key);
                if (columna?.esAutoIncremento) return false;
                return value && value.trim() !== '';
            });

            if (valoresNoVacios.length === 0) {
                document.getElementById('modalInsertarDatosErrorValores').showModal();
                setIsInserting(false);
                return;
            }

            // Construir la consulta INSERT
            const colummasInsert = valoresNoVacios.map(([key]) => key).join(', ');
            const valoresInsert = valoresNoVacios.map(([key, value]) => {
                // Determinar si el valor necesita comillas (strings) o no (números)
                const columna = columnas.find(col => col.nombre === key);
                const tipoColumna = columna?.tipo?.toLowerCase() || '';

                if (tipoColumna.includes('varchar') ||
                    tipoColumna.includes('text') ||
                    tipoColumna.includes('char') ||
                    tipoColumna.includes('date')) {
                    return `'${value.replace(/'/g, "''")}'`; // Escapar comillas simples
                } else {
                    return value;
                }
            }).join(', '); const consultaSQL = `INSERT INTO ${tabla} (${colummasInsert}) VALUES (${valoresInsert})`;

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatos}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                const valoresVacios = {};
                columnas.forEach(columna => {
                    valoresVacios[columna.nombre] = '';
                });
                setValores(valoresVacios);

                document.getElementById('modalInsertarDatos').close();

                document.getElementById('modalInsertarDatosOk').showModal();

                const textarea = document.getElementById('resultadoConsulta');
                if (textarea) {
                    textarea.value = `✅ Datos insertados correctamente en la tabla "${tabla}"`;
                }
            } else {
                const errorData = await response.text();

                const textarea = document.getElementById('resultadoConsulta');
                if (textarea) {
                    textarea.value = `❌ Error al insertar datos: ${errorData}`;
                }

                document.getElementById('modalInsertarDatosErrorServidor').showModal();
            }
        } catch (error) {

            // Mostrar error en textarea
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `❌ Error de conexión: ${error.message}`;
            }

            document.getElementById('modalInsertarDatosError').showModal();
        } finally {
            setIsInserting(false);
        }
    };

    const cancelar = () => {
        document.getElementById('modalInsertarDatos').close();
    };

    return (
        <dialog id="modalInsertarDatos" className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Insertar Datos en Tabla</h3>                {/* Información de base de datos y tabla */}
                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Base de datos: <strong>{baseDatos}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                        Tabla: <strong>{tabla}</strong>
                    </p>
                </div>

                {/* Formulario de campos */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Valores a insertar:</span>
                    </label>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {columnas.length > 0 ? (columnas.map((columna, index) => (<div key={index} className="flex gap-2 items-start bg-base-100 p-2 rounded min-h-12">
                            <label className="min-w-0 flex-shrink-0 font-medium flex items-start justify-start text-left py-3 pr-3" style={{ width: '25%' }}>
                                <span className="break-words leading-tight">
                                    {columna.nombre || `Columna ${index}`}
                                    {!columna.esNulo && <span className="text-red-500 ml-1">*</span>}
                                    {columna.esPrimaria && <span className="text-blue-500 ml-1">🔑</span>}
                                    {columna.esForanea && <span className="text-green-500 ml-1">🔗</span>}
                                    :
                                </span>
                            </label>

                            {/* Campo para clave foránea con selector */}
                            {columna.esForanea && valoresForaneas[columna.nombre] ? (
                                <select
                                    className={`select select-bordered flex-1 min-w-0 ${!columna.esNulo ? 'select-warning' : ''}`}
                                    value={valores[columna.nombre] || ''}
                                    onChange={(e) => handleValorChange(columna.nombre, e.target.value)}
                                    disabled={columna.esAutoIncremento}
                                >
                                    <option value="">
                                        {`Selecciona ${columna.columnaReferencia || 'valor'}${!columna.esNulo ? ' (Req.)' : ' (Opc.)'}`}
                                    </option>
                                    {valoresForaneas[columna.nombre].map((valor, idx) => (
                                        <option key={idx} value={valor}>
                                            {valor}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                /* Campo normal de input */
                                <input

                                    type="text"
                                    placeholder={`${columna.tipo || 'Valor'}${!columna.esNulo ? ' (Req.)' : ' (Opc.)'}`}
                                    className={`input input-bordered ml-4 w-80 ${!columna.esNulo ? 'input-warning' : ''}`}
                                    value={valores[columna.nombre] || ''}
                                    onChange={(e) => handleValorChange(columna.nombre, e.target.value)}
                                    disabled={columna.esAutoIncremento}
                                />
                            )}                            {/* Columna de información compacta */}
                            <div className="flex flex-col w-1/5">
                                <div className="text-xs text-gray-500 text-right font-medium">{columna.tipo || 'N/A'}</div>
                                <div className="flex flex-wrap justify-end gap-0.5 mt-0.5">
                                    {columna.esPrimaria && <span className="badge badge-primary badge-xs">PK</span>}
                                    {columna.esForanea && <span className="badge badge-success badge-xs">FK</span>}
                                    {columna.esAutoIncremento && <span className="badge badge-secondary badge-xs">AUTO</span>}
                                </div>
                                {columna.esForanea && columna.tablaReferencia && (
                                    <div className="text-xs text-green-600 mt-0.5 break-words leading-tight text-right">
                                        {columna.tablaReferencia}.{columna.columnaReferencia}
                                    </div>
                                )}
                            </div>
                        </div>
                        ))
                        ) : (
                            <div className="text-center text-gray-500 p-4">
                                {isLoading ? 'Cargando columnas...' : 'No se encontraron columnas'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones */}
                <div className="modal-action">
                    <button
                        className="btn btn-error"
                        onClick={cancelar}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={insertarDatos}
                    >
                        Insertar Datos
                    </button>
                </div>
            </div>
        </dialog>
    );
}

// Componente con todos los modales de error
function ModalInsertarDatosErrores() {
    return (
        <>
            {/* Error: Base de datos no seleccionada */}
            <dialog id="modalInsertarDatosErrorBase" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Por favor, selecciona una base de datos.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error: Tabla no seleccionada */}
            <dialog id="modalInsertarDatosErrorTabla" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Por favor, selecciona una tabla.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error: Sin columnas */}
            <dialog id="modalInsertarDatosErrorColumnas" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">No se pudieron obtener las columnas de la tabla seleccionada.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error: Valores vacíos */}
            <dialog id="modalInsertarDatosErrorValores" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Por favor, ingresa al menos un valor para insertar.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error del servidor */}
            <dialog id="modalInsertarDatosErrorServidor" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error del Servidor</h3>
                    <p className="py-4">Ocurrió un error al insertar los datos. Verifica los valores y el formato.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error general */}
            <dialog id="modalInsertarDatosError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error de Conexión</h3>
                    <p className="py-4">No se pudo conectar con el servidor. Verifica tu conexión.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Éxito */}
            <dialog id="modalInsertarDatosOk" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-success">¡Éxito!</h3>
                    <p className="py-4">Los datos se insertaron correctamente en la tabla.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-success">Aceptar</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}
