import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import VistaSelector from './VistaSelector';

export default function ConsultarCuboOLAPCard({ onConsultarVistaCubo }) {
    const [isOperating, setIsOperating] = useState(false);
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [vistaSeleccionada, setVistaSeleccionada] = useState('');
    const [campoFiltro, setCampoFiltro] = useState('');
    const [valorFiltro, setValorFiltro] = useState('');
    const [valoresFiltro, setValoresFiltro] = useState([]);
    const [resultado, setResultado] = useState(null);

    const cargarValoresFiltro = React.useCallback(async (campo) => {
        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/valores-filtro-vista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseDatos: baseDatosSeleccionada,
                    vista: vistaSeleccionada,
                    campo: campo
                })
            });

            if (response.ok) {
                const data = await response.json();
                setValoresFiltro(data.valores || []);
            }
        } catch (error) {
            console.error('Error al cargar valores de filtro:', error);
        }
    }, [baseDatosSeleccionada, vistaSeleccionada]);

    // Cargar información de la vista seleccionada
    const cargarInfoVista = React.useCallback(async () => {
        if (!vistaSeleccionada || !baseDatosSeleccionada) return;

        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/info-vista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    baseDatos: baseDatosSeleccionada,
                    vista: vistaSeleccionada
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.campoFiltro) {
                    setCampoFiltro(data.campoFiltro);
                    // Cargar valores únicos del campo filtro
                    cargarValoresFiltro(data.campoFiltro);
                }
            }
        } catch (error) {
            console.error('Error al cargar información de la vista:', error);
        }
    }, [baseDatosSeleccionada, vistaSeleccionada, cargarValoresFiltro]);

    React.useEffect(() => {
        if (vistaSeleccionada && baseDatosSeleccionada) {
            cargarInfoVista();
        } else {
            setCampoFiltro('');
            setValoresFiltro([]);
            setValorFiltro('');
        }
    }, [vistaSeleccionada, baseDatosSeleccionada, cargarInfoVista]);

    const handleConsultar = async () => {
        if (!vistaSeleccionada) {
            document.getElementById('modalErrorConsultarCubo').showModal();
            return;
        }

        setIsOperating(true);
        try {
            const parametros = {
                baseDatos: baseDatosSeleccionada,
                vista: vistaSeleccionada,
                valorFiltro: valorFiltro || null
            };

            const result = await onConsultarVistaCubo(parametros);
            setResultado(result);
        } catch (error) {
            console.error('Error al consultar vista del cubo:', error);
        } finally {
            setIsOperating(false);
        }
    };

    const limpiarResultado = () => {
        setResultado(null);
        setVistaSeleccionada('');
        setValorFiltro('');
    };

    const renderResultado = () => {
        if (!resultado || !resultado.columnas || !resultado.filas) {
            return null;
        }

        // Obtener todas las claves de la primera fila para determinar la estructura
        const primeraFila = resultado.filas[0];
        const todasLasColumnas = Object.keys(primeraFila);

        // Detectar automáticamente la dimensión X (campo de texto/categórico)
        let dimensionX = resultado.dimensionX;

        if (!dimensionX) {
            // Buscar la columna que contiene valores de texto (no numéricos)
            dimensionX = todasLasColumnas.find(col => {
                const valor = primeraFila[col];
                return isNaN(valor) || typeof valor === 'string';
            });

            // Si no encontramos ninguna columna de texto, usar la primera
            if (!dimensionX) {
                dimensionX = todasLasColumnas[0];
            }
        }

        // Filtrar las columnas de datos (excluir la dimensión X)
        const columnasDatos = todasLasColumnas.filter(col => col !== dimensionX);

        return (
            <div className="mt-4 overflow-x-auto">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Resultado de la consulta:
                    {valorFiltro && (
                        <span className="text-sm text-accent ml-2">
                            (Filtrado por: {campoFiltro} = {valorFiltro})
                        </span>
                    )}
                </h3>
                <table className="table table-zebra table-sm">
                    <thead>
                        <tr>
                            <th className="font-bold bg-primary text-primary-content">{dimensionX}</th>
                            {columnasDatos.map((col, index) => (
                                <th key={index} className="text-center">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.filas.map((fila, index) => (
                            <tr key={index}>
                                <td className="font-semibold bg-base-200">{fila[dimensionX]}</td>
                                {columnasDatos.map((col, colIndex) => (
                                    <td key={colIndex} className="text-center">
                                        {fila[col] !== undefined ? fila[col] : 0}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-2 p-3 bg-base-200 rounded">
                    <h4 className="font-semibold">Resumen:</h4>
                    <p className="text-sm">
                        Total de filas: {resultado.filas.length} |
                        Columnas de datos: {columnasDatos.length} |
                        Dimensión principal: {dimensionX}
                    </p>
                </div>

                {/* Debug info - remover en producción */}
                <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Debug: Estructura de datos</summary>
                    <pre className="text-xs bg-base-300 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify({
                            dimensionX,
                            columnasDatos,
                            todasLasColumnas,
                            primeraFila,
                            deteccionAutomatica: !resultado.dimensionX
                        }, null, 2)}
                    </pre>
                </details>
            </div>
        );
    };

    // Función para manejar el cambio de base de datos
    const handleBaseDatosChange = (nuevaBaseDatos) => {
        setBaseDatosSeleccionada(nuevaBaseDatos);
        // Limpiar formulario cuando cambia la base de datos
        setVistaSeleccionada('');
        setCampoFiltro('');
        setValorFiltro('');
        setValoresFiltro([]);
        setResultado(null);
    };

    return (
        <div className="card w-full max-w-3xl shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Consultar Cubo OLAP</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Base de datos */}
                    <div>
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

                    {/* Vista del cubo */}
                    <div>
                        <label className="label">
                            <span className="label-text text-white">Vista del cubo:</span>
                        </label>
                        <VistaSelector
                            baseDatos={baseDatosSeleccionada}
                            value={vistaSeleccionada}
                            onVistaChange={setVistaSeleccionada}
                            placeholder="Selecciona vista del cubo"
                            className="select select-secondary w-full"
                        />
                    </div>

                    {/* Filtro por dimensión Z */}
                    {campoFiltro && (
                        <div>
                            <label className="label">
                                <span className="label-text text-white">
                                    Filtrar por {campoFiltro}:
                                </span>
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

                {/* Información de la vista seleccionada */}
                {vistaSeleccionada && (
                    <div className="bg-base-200 p-3 rounded">
                        <h4 className="font-semibold text-sm">Vista seleccionada: {vistaSeleccionada}</h4>
                        {campoFiltro && (
                            <p className="text-xs text-gray-600">
                                Dimensión de filtro disponible: {campoFiltro}
                            </p>
                        )}
                    </div>
                )}

                {/* Botones de acción */}
                <div className="card-actions justify-end gap-2">
                    <button
                        className="btn btn-ghost"
                        onClick={limpiarResultado}
                        disabled={isOperating}
                    >
                        Limpiar
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleConsultar}
                        disabled={isOperating || !vistaSeleccionada}
                    >
                        {isOperating ? 'Consultando...' : 'Consultar Cubo'}
                    </button>
                </div>

                {/* Mostrar resultado */}
                {renderResultado()}
            </div>

            {/* Modal de error */}
            <dialog id="modalErrorConsultarCubo" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">
                        Por favor, selecciona una vista del cubo OLAP.
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
