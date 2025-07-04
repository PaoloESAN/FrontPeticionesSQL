import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import TablaSelector from './TablaSelector';
import ColumnaSelector from './ColumnaSelector';

export default function CuboOLAPCard({ onEjecutarCuboOLAP, onGuardarVistaCubo }) {
    const [isOperating, setIsOperating] = useState(false);
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tablaSeleccionada, setTablaSeleccionada] = useState('');
    const [dimensionX, setDimensionX] = useState(''); // Dimensión fila
    const [dimensionY, setDimensionY] = useState(''); // Dimensión columna
    const [campoValores, setCampoValores] = useState(''); // Campo de datos a agregar
    const [campoFiltro, setCampoFiltro] = useState(''); // Campo para filtro Z
    const [valorFiltro, setValorFiltro] = useState(''); // Valor específico del filtro
    const [tipoAgregacion, setTipoAgregacion] = useState('SUM');
    const [nombreVista, setNombreVista] = useState('');
    const [valoresFiltro, setValoresFiltro] = useState([]);
    const [resultado, setResultado] = useState(null);

    const cargarValoresFiltro = React.useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/valores-filtro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseDatos: baseDatosSeleccionada,
                    tabla: tablaSeleccionada,
                    campo: campoFiltro
                })
            });

            if (response.ok) {
                const data = await response.json();
                setValoresFiltro(data.valores || []);
            }
        } catch (error) {
            console.error('Error al cargar valores de filtro:', error);
        }
    }, [baseDatosSeleccionada, tablaSeleccionada, campoFiltro]);

    // Cargar valores únicos del campo filtro cuando se selecciona
    React.useEffect(() => {
        if (tablaSeleccionada && campoFiltro && baseDatosSeleccionada) {
            cargarValoresFiltro();
        }
    }, [tablaSeleccionada, campoFiltro, baseDatosSeleccionada, cargarValoresFiltro]);

    // Función para manejar el cambio de base de datos
    const handleBaseDatosChange = (nuevaBaseDatos) => {
        setBaseDatosSeleccionada(nuevaBaseDatos);
        // Limpiar formulario cuando cambia la base de datos
        setTablaSeleccionada('');
        setDimensionX('');
        setDimensionY('');
        setCampoValores('');
        setCampoFiltro('');
        setValorFiltro('');
        setValoresFiltro([]);
        setResultado(null);
    };

    const handleEjecutarCubo = async () => {
        if (!tablaSeleccionada || !dimensionX || !dimensionY || !campoValores) {
            document.getElementById('modalErrorCuboOLAP').showModal();
            return;
        }

        setIsOperating(true);
        try {
            const parametros = {
                baseDatos: baseDatosSeleccionada,
                tabla: tablaSeleccionada,
                dimensionX,
                dimensionY,
                campoValores,
                tipoAgregacion,
                campoFiltro,
                valorFiltro
            };

            const result = await onEjecutarCuboOLAP(parametros);
            setResultado(result);
        } catch (error) {
            console.error('Error al ejecutar cubo OLAP:', error);
        } finally {
            setIsOperating(false);
        }
    };

    const handleGuardarVista = async () => {
        if (!nombreVista.trim()) {
            document.getElementById('modalErrorNombreVista').showModal();
            return;
        }

        if (!tablaSeleccionada || !dimensionX || !dimensionY || !campoValores) {
            document.getElementById('modalErrorCuboOLAP').showModal();
            return;
        }

        setIsOperating(true);
        try {
            const parametros = {
                baseDatos: baseDatosSeleccionada,
                nombreVista: nombreVista.trim(),
                tabla: tablaSeleccionada,
                dimensionX,
                dimensionY,
                campoValores,
                tipoAgregacion,
                campoFiltro
            };

            await onGuardarVistaCubo(parametros);
            setNombreVista('');
            document.getElementById('modalExitoVistaCubo').showModal();
        } catch (error) {
            console.error('Error al guardar vista del cubo:', error);
        } finally {
            setIsOperating(false);
        }
    };

    const limpiarFormulario = () => {
        setTablaSeleccionada('');
        setDimensionX('');
        setDimensionY('');
        setCampoValores('');
        setCampoFiltro('');
        setValorFiltro('');
        setNombreVista('');
        setResultado(null);
        setValoresFiltro([]);
    };

    const renderResultado = () => {
        if (!resultado || !resultado.columnas || !resultado.filas) {
            return null;
        }

        // Obtener todas las claves de la primera fila para determinar la estructura
        const primeraFila = resultado.filas[0];
        const todasLasColumnas = Object.keys(primeraFila);

        // Detectar automáticamente la dimensión X basándose en el formulario o tipo de datos
        let dimensionXActual = dimensionX; // La seleccionada en el formulario

        if (!dimensionXActual) {
            // Buscar la columna que contiene valores de texto (no numéricos)
            dimensionXActual = todasLasColumnas.find(col => {
                const valor = primeraFila[col];
                return isNaN(valor) || typeof valor === 'string';
            });

            // Si no encontramos ninguna columna de texto, usar la primera
            if (!dimensionXActual) {
                dimensionXActual = todasLasColumnas[0];
            }
        }

        // Filtrar las columnas de datos (excluir la dimensión X)
        const columnasDatos = todasLasColumnas.filter(col => col !== dimensionXActual);

        return (
            <div className="mt-4 overflow-x-auto">
                <h3 className="text-lg font-semibold text-white mb-2">Resultado del Cubo OLAP:</h3>
                <table className="table table-zebra table-sm">
                    <thead>
                        <tr>
                            <th className="font-bold bg-primary text-primary-content">{dimensionXActual}</th>
                            {columnasDatos.map((col, index) => (
                                <th key={index} className="text-center">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.filas.map((fila, index) => (
                            <tr key={index}>
                                <td className="font-semibold bg-base-200">{fila[dimensionXActual]}</td>
                                {columnasDatos.map((col, colIndex) => (
                                    <td key={colIndex} className="text-center">
                                        {fila[col] !== undefined ? fila[col] : 0}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Información del cubo */}
                <div className="mt-2 p-3 bg-base-200 rounded">
                    <h4 className="font-semibold">Configuración del Cubo:</h4>
                    <p className="text-sm">
                        Dimensión X (Filas): {dimensionXActual} |
                        Dimensión Y (Columnas): {dimensionY} |
                        Agregación: {tipoAgregacion}({campoValores})
                        {valorFiltro && ` | Filtro: ${campoFiltro} = ${valorFiltro}`}
                    </p>
                </div>

                {/* Debug info - remover en producción */}
                <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Debug: Estructura de datos</summary>
                    <pre className="text-xs bg-base-300 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify({
                            dimensionXFormulario: dimensionX,
                            dimensionXActual,
                            columnasDatos,
                            todasLasColumnas,
                            primeraFila,
                            deteccionAutomatica: !dimensionX
                        }, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };

    return (
        <div className="card w-full max-w-4xl shadow-lg bg-purple-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Cubo OLAP (Análisis Multidimensional)</h2>

                {/* Selector de base de datos */}
                <div className="mb-4">
                    <label className="label">
                        <span className="label-text text-white">Base de datos:</span>
                    </label>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={handleBaseDatosChange}
                        placeholder="Selecciona base de datos"
                        className="select select-secondary w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tabla base */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Tabla de hechos:</span>
                        </label>
                        <TablaSelector
                            baseDatos={baseDatosSeleccionada}
                            value={tablaSeleccionada}
                            onTablaChange={setTablaSeleccionada}
                            placeholder="Selecciona tabla"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Dimensión X (Filas) */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Dimensión X (Filas):</span>
                        </label>
                        <ColumnaSelector
                            baseDatos={baseDatosSeleccionada}
                            tabla={tablaSeleccionada}
                            value={dimensionX}
                            onColumnaChange={setDimensionX}
                            placeholder="Selecciona columna"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Dimensión Y (Columnas) */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Dimensión Y (Columnas):</span>
                        </label>
                        <ColumnaSelector
                            baseDatos={baseDatosSeleccionada}
                            tabla={tablaSeleccionada}
                            value={dimensionY}
                            onColumnaChange={setDimensionY}
                            placeholder="Selecciona columna"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Campo de valores */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Campo de datos:</span>
                        </label>
                        <ColumnaSelector
                            baseDatos={baseDatosSeleccionada}
                            tabla={tablaSeleccionada}
                            value={campoValores}
                            onColumnaChange={setCampoValores}
                            placeholder="Selecciona campo numérico"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Tipo de agregación */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Función de agregación:</span>
                        </label>
                        <select
                            className="select select-secondary w-full"
                            value={tipoAgregacion}
                            onChange={(e) => setTipoAgregacion(e.target.value)}
                        >
                            <option value="SUM">SUMA</option>
                            <option value="COUNT">CONTAR</option>
                            <option value="AVG">PROMEDIO</option>
                            <option value="MAX">MÁXIMO</option>
                            <option value="MIN">MÍNIMO</option>
                        </select>
                    </div>

                    {/* Campo filtro Z */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Campo filtro Z (opcional):</span>
                        </label>
                        <ColumnaSelector
                            baseDatos={baseDatosSeleccionada}
                            tabla={tablaSeleccionada}
                            value={campoFiltro}
                            onColumnaChange={setCampoFiltro}
                            placeholder="Selecciona campo filtro"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Valor del filtro */}
                    {campoFiltro && (
                        <div>
                            <label className="label">
                                <span className="label-text text-white">Valor del filtro:</span>
                            </label>
                            <select
                                className="select select-secondary w-full"
                                value={valorFiltro}
                                onChange={(e) => setValorFiltro(e.target.value)}
                            >
                                <option value="">Todos los valores</option>
                                {valoresFiltro.map((valor, index) => (
                                    <option key={index} value={valor}>{valor}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Sección para guardar como vista */}
                <div className="divider divider-secondary"></div>
                <div>
                    <label className="label">
                        <span className="label-text text-white">Nombre para guardar como vista (opcional):</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre de la vista"
                        className="input input-secondary w-full"
                        value={nombreVista}
                        onChange={(e) => setNombreVista(e.target.value)}
                    />
                </div>

                {/* Botones de acción */}
                <div className="card-actions justify-end gap-2">
                    <button
                        className="btn btn-ghost"
                        onClick={limpiarFormulario}
                        disabled={isOperating}
                    >
                        Limpiar
                    </button>

                    {nombreVista.trim() && (
                        <button
                            className="btn btn-accent"
                            onClick={handleGuardarVista}
                            disabled={isOperating}
                        >
                            {isOperating ? 'Guardando...' : 'Guardar Vista'}
                        </button>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleEjecutarCubo}
                        disabled={isOperating}
                    >
                        {isOperating ? 'Ejecutando...' : 'Ejecutar Cubo'}
                    </button>
                </div>

                {/* Mostrar resultado */}
                {renderResultado()}
            </div>

            {/* Modales de error y éxito */}
            <dialog id="modalErrorCuboOLAP" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">
                        Por favor, selecciona la tabla, dimensión X, dimensión Y y el campo de datos.
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="modalErrorNombreVista" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">
                        Por favor, ingresa un nombre para la vista.
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="modalExitoVistaCubo" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-success">Éxito</h3>
                    <p className="py-4">
                        La vista del cubo OLAP se ha guardado correctamente.
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-success">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
