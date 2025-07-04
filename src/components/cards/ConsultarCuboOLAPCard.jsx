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
                valorFiltro: valorFiltro || null,
                campoFiltro: campoFiltro || null  // Pasar el campo filtro para que se pueda excluir de la tabla
            };

            console.log('ConsultarCuboOLAPCard - Ejecutando con parámetros:', parametros);
            const result = await onConsultarVistaCubo(parametros);
            console.log('ConsultarCuboOLAPCard - Resultado recibido:', result);
        } catch (error) {
            console.error('Error al consultar vista del cubo:', error);
        } finally {
            setIsOperating(false);
        }
    };

    const limpiarFormulario = () => {
        setVistaSeleccionada('');
        setValorFiltro('');
    };

    // Función para manejar el cambio de base de datos
    const handleBaseDatosChange = (nuevaBaseDatos) => {
        setBaseDatosSeleccionada(nuevaBaseDatos);
        // Limpiar formulario cuando cambia la base de datos
        setVistaSeleccionada('');
        setCampoFiltro('');
        setValorFiltro('');
        setValoresFiltro([]);
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
                            filtro={(vista) => vista.endsWith('_cubo')} // Solo mostrar vistas que terminen con "_cubo"
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

                {/* Botones de acción */}
                <div className="card-actions justify-end gap-2">
                    <button
                        className="btn btn-ghost"
                        onClick={limpiarFormulario}
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
