import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { ModalCrearBase, ModalEliminarBase, ModalConsultaBase } from '../components/AllModal'
import { useBaseDatos } from '../hooks/useBaseDatos'
import {
    CrearBaseCard,
    EliminarBaseCard,
    CrearTablaCard,
    EliminarTablaCard,
    InsertarDatosCard,
    CrearVistaCard,
    EliminarVistaCard,
    EjecutarVistaCard,
    CrearProcedureCard,
    EliminarProcedureCard,
    EjecutarProcedureCard,
    ConsultaCard,
    ConsultaPersonalizadaCard,
    DatosCard
} from '../components/cards/index.js'

export default function Inicio() {
    const [pestanaActiva, setPestanaActiva] = useState('bases-datos');
    const [datosTabla, setDatosTabla] = useState([]);
    const [columnasTabla, setColumnasTabla] = useState([]);
    const [consultaEjecutada, setConsultaEjecutada] = useState(false);    // Función personalizada para manejar consultas con resultados de tabla
    const ejecutarConsultaConTabla = async (consultaSQL, baseDatosSeleccionada, datosDirectos = null) => {
        try {
            let data;

            if (datosDirectos) {
                // Si recibimos datos directos del nuevo endpoint, usarlos
                data = datosDirectos;
            } else {
                // Si no, usar el endpoint original
                const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                    method: 'POST',
                });

                if (!response.ok) {
                    document.getElementById('modalConsultaErrorBase')?.showModal();
                    const errorData = await response.json();
                    console.error('Error en la consulta:', errorData);
                    return;
                }

                data = await response.json();
            }            // Si estamos en consultas, vistas o procedures, procesar para tabla
            if (pestanaActiva === 'consultas' || pestanaActiva === 'vistas' || pestanaActiva === 'procedures') {
                console.log('Procesando datos para tabla:', { datosDirectos: !!datosDirectos, data, pestanaActiva });

                // Marcar que se ejecutó una consulta
                setConsultaEjecutada(true);

                if (datosDirectos) {
                    // Datos directos del nuevo endpoint - verificar si tiene formato {respuesta: "..."}
                    console.log('Datos directos recibidos:', data);

                    let resultados;

                    if (data.respuesta) {
                        // El endpoint devuelve {respuesta: "[...]"} - parsear el string JSON
                        try {
                            resultados = JSON.parse(data.respuesta);
                            console.log('Datos parseados desde respuesta:', resultados);
                        } catch (parseError) {
                            console.error('Error al parsear respuesta:', parseError);
                            resultados = [];
                        }
                    } else if (Array.isArray(data)) {
                        // El endpoint devuelve directamente un array
                        resultados = data;
                        console.log('Datos directos como array:', resultados);
                    } else {
                        console.log('Formato de datos no reconocido:', data);
                        resultados = [];
                    }

                    if (Array.isArray(resultados) && resultados.length > 0) {
                        // Extraer columnas del primer objeto
                        const columnas = Object.keys(resultados[0]);
                        console.log('Columnas extraídas:', columnas);
                        setColumnasTabla(columnas);
                        setDatosTabla(resultados);
                        console.log('Estados actualizados - columnas:', columnas, 'datos:', resultados);
                    } else if (Array.isArray(resultados) && resultados.length === 0) {
                        console.log('Array vacío recibido');
                        setColumnasTabla([]);
                        setDatosTabla([]);
                    } else {
                        console.log('Resultados no son array o están vacíos:', resultados);
                        setColumnasTabla([]);
                        setDatosTabla([]);
                    }
                } else {
                    // Procesar respuesta del endpoint original
                    try {
                        // Intentar parsear la respuesta como JSON para datos tabulares
                        const resultados = JSON.parse(data.respuesta);

                        if (Array.isArray(resultados) && resultados.length > 0) {
                            // Extraer columnas del primer objeto
                            const columnas = Object.keys(resultados[0]);
                            setColumnasTabla(columnas);
                            setDatosTabla(resultados);
                        } else {
                            setColumnasTabla([]);
                            setDatosTabla([]);
                        }
                    } catch {
                        // Si no se puede parsear como JSON, mostrar en textarea
                        const resultado = document.getElementById('resultadoConsulta');
                        if (resultado) {
                            resultado.value = data.respuesta;
                        }
                        setColumnasTabla([]);
                        setDatosTabla([]);
                    }
                }
            } else {
                // Para otras pestañas, usar textarea como antes
                const resultado = document.getElementById('resultadoConsulta');
                if (resultado) {
                    resultado.value = datosDirectos ? JSON.stringify(data, null, 2) : data.respuesta;
                }
            }

            setConsultaEjecutada(true);
            console.log('Consulta ejecutada:', data);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalConsultaError')?.showModal();
        }
    };

    const { crearBase, eliminarBase } = useBaseDatos();

    const renderContenido = () => {
        switch (pestanaActiva) {
            case 'bases-datos':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearBaseCard onCrearBase={crearBase} />
                        <EliminarBaseCard onEliminarBase={eliminarBase} />
                        <DatosCard />
                    </div>
                ); case 'tablas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearTablaCard />
                        <EliminarTablaCard />
                        <InsertarDatosCard />
                    </div>
                );
            case 'vistas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearVistaCard />
                        <EliminarVistaCard />
                        <EjecutarVistaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                    </div>
                );
            case 'procedures':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearProcedureCard />
                        <EliminarProcedureCard />
                        <EjecutarProcedureCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                    </div>
                );
            case 'consultas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <ConsultaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <ConsultaPersonalizadaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                    </div>
                );
            default:
                return <div className="text-center text-gray-500 mt-8">Selecciona una categoría del menú lateral</div>;
        }
    };

    const navegarA = (pestaña) => {
        setPestanaActiva(pestaña);
        // Limpiar datos de tabla cuando se cambie de pestaña
        setDatosTabla([]);
        setColumnasTabla([]);
        setConsultaEjecutada(false);
        // Cerrar el drawer después de seleccionar
        document.getElementById('sidebar-drawer').checked = false;
    }; const renderResultados = () => {
        const mostrarTabla = pestanaActiva === 'consultas' || pestanaActiva === 'vistas' || pestanaActiva === 'procedures';

        console.log('renderResultados:', {
            mostrarTabla,
            pestanaActiva,
            columnasTabla: columnasTabla.length,
            datosTabla: datosTabla.length
        });

        if (mostrarTabla) {
            return (
                <div className="overflow-x-auto">
                    <table className="table table-xs table-pin-rows table-pin-cols">
                        <thead>
                            <tr>
                                <th></th>
                                {columnasTabla.length > 0 ? (
                                    columnasTabla.map((columna, index) => (
                                        <td key={index}>{columna}</td>
                                    ))
                                ) : (
                                    <>
                                        <td>Columna 1</td>
                                        <td>Columna 2</td>
                                        <td>Columna 3</td>
                                    </>
                                )}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosTabla.length > 0 ? (
                                datosTabla.map((fila, index) => (
                                    <tr key={index}>
                                        <th>{index + 1}</th>
                                        {columnasTabla.length > 0 ? (
                                            columnasTabla.map((columna, colIndex) => (
                                                <td key={colIndex}>{fila[columna] || '-'}</td>
                                            ))
                                        ) : (
                                            Object.values(fila).map((valor, colIndex) => (
                                                <td key={colIndex}>{valor || '-'}</td>
                                            ))
                                        )}
                                        <th>{index + 1}</th>
                                    </tr>
                                ))) : (
                                <tr>
                                    <th>-</th>
                                    <td colSpan={columnasTabla.length > 0 ? columnasTabla.length : 3}>
                                        {consultaEjecutada
                                            ? "No se encontraron datos para esta consulta"
                                            : "Los resultados de las consultas aparecerán aquí..."
                                        }
                                    </td>
                                    <th>-</th>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th></th>
                                {columnasTabla.length > 0 ? (
                                    columnasTabla.map((columna, index) => (
                                        <td key={index}>{columna}</td>
                                    ))
                                ) : (
                                    <>
                                        <td>Columna 1</td>
                                        <td>Columna 2</td>
                                        <td>Columna 3</td>
                                    </>
                                )}
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            );
        }

        return (
            <textarea
                id='resultadoConsulta'
                placeholder="Los resultados de las consultas aparecerán aquí..."
                className="h-60 textarea textarea-primary w-full text-lg"
                disabled
            />
        );
    };

    const getTitulo = () => {
        switch (pestanaActiva) {
            case 'bases-datos': return 'Gestión de Bases de Datos';
            case 'tablas': return 'Gestión de Tablas';
            case 'vistas': return 'Gestión de Vistas';
            case 'procedures': return 'Gestión de Stored Procedures';
            case 'consultas': return 'Consultas SQL';
            default: return 'Administrador de Base de Datos';
        }
    };

    const menuItems = [
        {
            id: 'bases-datos',
            titulo: 'Bases de Datos',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
            )
        },
        {
            id: 'tablas',
            titulo: 'Tablas',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h3M3 19h18" />
                </svg>
            )
        },
        {
            id: 'vistas',
            titulo: 'Vistas',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )
        },
        {
            id: 'procedures',
            titulo: 'Procedures',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                </svg>
            )
        },
        {
            id: 'consultas',
            titulo: 'Consultas',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    return (
        <div className="drawer">
            <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

            {/* Contenido principal */}
            <div className="drawer-content flex flex-col min-h-screen">
                {/* Navbar fijo */}
                <header className="sticky top-0 z-10">
                    <Navbar />
                </header>

                {/* Contenido de la página */}
                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold ">{getTitulo()}</h1>
                    </div>

                    {/* Cards dinámicas */}
                    <div className="mb-8">
                        {renderContenido()}
                    </div>

                    {/* Resultados dinámicos */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Resultados:</h2>
                        {renderResultados()}
                    </div>
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-20">
                <label htmlFor="sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <aside className="bg-base-200 text-base-content min-h-full w-60">
                    {/* Header del sidebar */}
                    <div className="p-4 border-b border-base-300">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            DatabaseFix
                        </h2>
                        <p className="text-sm text-base-content/70 mt-1">Administrador de bases de datos</p>
                    </div>

                    {/* Menú de navegación */}
                    <ul className="menu p-4 space-y-2 w-full">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <a
                                    onClick={() => navegarA(item.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${pestanaActiva === item.id
                                        ? 'bg-primary text-primary-content shadow-md'
                                        : 'hover:bg-base-300'
                                        }`}
                                >
                                    {item.icono}
                                    <span className="font-medium">{item.titulo}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Footer del sidebar */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                            <p className="text-xs text-base-content/60 text-center">
                                Selecciona una categoría para ver las opciones disponibles
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modales globales */}
            <ModalCrearBase />
            <ModalEliminarBase />
            <ModalConsultaBase />
        </div>
    )
}
