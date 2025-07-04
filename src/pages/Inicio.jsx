import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { ModalCrearBase, ModalEliminarBase, ModalConsultaBase } from '../components/AllModal'
import { useBaseDatos } from '../hooks/useBaseDatos'
import {
    CrearBaseCard,
    EliminarBaseCard,
    ListarBasesCard,
    CrearTablaCard,
    EliminarTablaCard,
    ListarTablasCard,
    InsertarDatosCard,
    CrearVistaCard,
    EliminarVistaCard,
    ListarVistasCard,
    EjecutarVistaCard,
    CrearProcedureCard,
    EliminarProcedureCard,
    ListarProceduresCard,
    EjecutarProcedureCard,
    ConsultaCard,
    ConsultaPersonalizadaCard,
    DatosCard,
    CrearDataWarehouseCard,
    ListarDataWarehousesCard,
    EliminarDataWarehouseCard,
    ConsultarDataWarehouseCard,
    CrearDataMartCard,
    CuboOLAPCard,
    ConsultarCuboOLAPCard
} from '../components/cards/index.js'

export default function Inicio() {
    const [pestanaActiva, setPestanaActiva] = useState('bases-datos');
    const [datosTabla, setDatosTabla] = useState([]);
    const [columnasTabla, setColumnasTabla] = useState([]);
    const [consultaEjecutada, setConsultaEjecutada] = useState(false);
    const [mostrarTabla, setMostrarTabla] = useState(false);

    const mostrarEnTextarea = async () => {
        setMostrarTabla(false);
        setConsultaEjecutada(true);

        setDatosTabla([]);
        setColumnasTabla([]);

        await new Promise(resolve => setTimeout(resolve, 0));

        const textarea = document.getElementById('resultadoConsulta');
        if (textarea) {
            textarea.value = 'Cargando...';
        }
    };

    const ejecutarConsultaConTabla = async (consultaSQL, baseDatosSeleccionada, datosDirectos = null, parametrosCubo = null, esConsultaVistaCubo = false) => {
        try {
            let data;

            if (datosDirectos) {
                data = datosDirectos;
            } else {
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
            }
            if (pestanaActiva === 'consultas' || pestanaActiva === 'vistas' || pestanaActiva === 'procedures' || pestanaActiva === 'datawarehouse' || pestanaActiva === 'cubo-olap') {
                console.log('Procesando datos para tabla:', { datosDirectos: !!datosDirectos, data, pestanaActiva });

                setConsultaEjecutada(true);
                setMostrarTabla(true);

                if (datosDirectos) {
                    console.log('Datos directos recibidos:', data);

                    let resultados;

                    if (data.respuesta) {
                        try {
                            resultados = JSON.parse(data.respuesta);
                            console.log('Datos parseados desde respuesta:', resultados);
                        } catch (parseError) {
                            console.error('Error al parsear respuesta:', parseError);
                            resultados = [];
                        }
                    } else if (Array.isArray(data)) {
                        resultados = data;
                        console.log('Datos directos como array:', resultados);
                    } else {
                        console.log('Formato de datos no reconocido:', data);
                        resultados = [];
                    }

                    if (Array.isArray(resultados) && resultados.length > 0) {
                        const columnas = Object.keys(resultados[0]);
                        console.log('Columnas extraídas:', columnas);

                        // Si es pestaña cubo-olap, agregar fila de totales
                        if (pestanaActiva === 'cubo-olap') {
                            console.log('=== INICIO PROCESAMIENTO CUBO OLAP ===');
                            console.log('Columnas originales:', columnas);
                            console.log('Parámetros del cubo recibidos:', parametrosCubo);

                            // Excluir el campo filtro de las columnas si está definido
                            let columnasFiltradas = columnas;
                            if (parametrosCubo && parametrosCubo.campoFiltro) {
                                console.log('Campo filtro detectado:', parametrosCubo.campoFiltro);
                                columnasFiltradas = columnas.filter(col => col !== parametrosCubo.campoFiltro);
                                console.log('Columnas después de filtrar campo filtro:', columnasFiltradas);
                            } else {
                                console.log('No hay campo filtro o parámetros del cubo no definidos');
                            }

                            // Detectar la dimensión X (columna de texto)
                            const primeraFila = resultados[0];
                            const dimensionX = columnasFiltradas.find(col => {
                                const valor = primeraFila[col];
                                return isNaN(valor) || typeof valor === 'string';
                            }) || columnasFiltradas[0];

                            console.log('Dimensión X detectada:', dimensionX);

                            // Detectar campos que no son numéricos para excluirlos de los totales
                            const camposTexto = columnasFiltradas.filter(col => {
                                const valor = primeraFila[col];
                                return isNaN(valor) || typeof valor === 'string';
                            });

                            console.log('Campos de texto detectados:', camposTexto);

                            // Calcular totales solo para columnas numéricas (excluir dimensión X y campos de texto)
                            const columnasDatos = columnasFiltradas.filter(col => !camposTexto.includes(col));
                            console.log('Columnas de datos numéricas:', columnasDatos);

                            // AGRUPACIÓN: Solo agrupar si viene de ConsultarCuboOLAPCard (cuando hay duplicados por campo filtro)
                            let resultadosParaProcesar = resultados;
                            if (esConsultaVistaCubo) {
                                console.log('=== INICIANDO AGRUPACIÓN (solo para ConsultarCuboOLAPCard) ===');
                                const datosAgrupados = new Map();
                                resultados.forEach(fila => {
                                    // Crear una clave única basada en los campos de texto (dimensiones)
                                    const claveDimensiones = camposTexto.map(campo => fila[campo]).join('|');

                                    if (datosAgrupados.has(claveDimensiones)) {
                                        // Si ya existe esta combinación de dimensiones, sumar los valores numéricos
                                        const filaExistente = datosAgrupados.get(claveDimensiones);
                                        columnasDatos.forEach(colNumérica => {
                                            filaExistente[colNumérica] = (parseFloat(filaExistente[colNumérica]) || 0) + (parseFloat(fila[colNumérica]) || 0);
                                        });
                                    } else {
                                        // Si es nueva, crear una nueva entrada con solo las columnas filtradas
                                        const nuevaFila = {};
                                        camposTexto.forEach(campo => {
                                            nuevaFila[campo] = fila[campo];
                                        });
                                        columnasDatos.forEach(colNumérica => {
                                            nuevaFila[colNumérica] = parseFloat(fila[colNumérica]) || 0;
                                        });
                                        datosAgrupados.set(claveDimensiones, nuevaFila);
                                    }
                                });

                                // Convertir el Map de vuelta a un array
                                resultadosParaProcesar = Array.from(datosAgrupados.values());
                                console.log('Datos después de agrupar:', resultadosParaProcesar);
                                console.log('=== AGRUPACIÓN COMPLETADA ===');
                            } else {
                                console.log('No se aplica agrupación (no es ConsultarCuboOLAPCard)');
                            }

                            const filaTotales = { [dimensionX]: '' };

                            columnasDatos.forEach(col => {
                                filaTotales[col] = resultadosParaProcesar.reduce((suma, fila) => {
                                    const valor = parseFloat(fila[col]) || 0;
                                    return suma + valor;
                                }, 0);
                            });

                            // Agregar columna de totales por fila (suma horizontal)
                            const resultadosConTotalColumna = resultadosParaProcesar.map(fila => {
                                const totalFila = columnasDatos.reduce((suma, col) => {
                                    const valor = parseFloat(fila[col]) || 0;
                                    return suma + valor;
                                }, 0);

                                // Filtrar solo las columnas que queremos mostrar (excluyendo campo filtro)
                                const filaFiltrada = { [dimensionX]: fila[dimensionX] };
                                columnasDatos.forEach(col => {
                                    filaFiltrada[col] = fila[col];
                                });
                                filaFiltrada[''] = totalFila;

                                return filaFiltrada;
                            });

                            // Calcular el gran total (suma de todos los valores)
                            const granTotal = columnasDatos.reduce((suma, col) => {
                                return suma + (filaTotales[col] || 0);
                            }, 0);

                            // Agregar gran total a la fila de totales
                            filaTotales[''] = granTotal;

                            // Agregar la fila de totales al final
                            const resultadosFinales = [...resultadosConTotalColumna, filaTotales];

                            // Crear array de columnas filtradas: dimensión X + columnas numéricas + total
                            const columnasParaMostrar = [dimensionX, ...columnasDatos, ''];

                            console.log('Fila de totales creada:', filaTotales);
                            console.log('Resultados con totales completos:', resultadosFinales);
                            console.log('Columnas a mostrar (sin campo filtro):', columnasParaMostrar);
                            console.log('=== FIN PROCESAMIENTO CUBO OLAP ===');

                            setColumnasTabla(columnasParaMostrar);
                            setDatosTabla(resultadosFinales);
                        } else {
                            setColumnasTabla(columnas);
                            setDatosTabla(resultados);
                        }

                        console.log('Estados actualizados - columnas:', columnas, 'datos:', pestanaActiva === 'cubo-olap' ? 'con totales' : resultados.length);
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
                    try {
                        const resultados = JSON.parse(data.respuesta);

                        if (Array.isArray(resultados) && resultados.length > 0) {
                            const columnas = Object.keys(resultados[0]);
                            setColumnasTabla(columnas);
                            setDatosTabla(resultados);
                        } else {
                            setColumnasTabla([]);
                            setDatosTabla([]);
                        }
                    } catch {
                        const resultado = document.getElementById('resultadoConsulta');
                        if (resultado) {
                            resultado.value = data.respuesta;
                        }
                        setColumnasTabla([]);
                        setDatosTabla([]);
                    }
                }
            } else {
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

    // Funciones para Cubo OLAP
    const ejecutarCuboOLAP = async (parametros) => {
        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/ejecutar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parametros)
            });

            if (!response.ok) {
                throw new Error('Error al ejecutar cubo OLAP');
            }

            const data = await response.json();

            // Convertir el resultado del cubo OLAP al formato esperado por ejecutarConsultaConTabla
            if (data.filas && data.filas.length > 0) {
                return {
                    respuesta: JSON.stringify(data.filas)
                };
            } else {
                return {
                    respuesta: JSON.stringify([])
                };
            }
        } catch (error) {
            console.error('Error ejecutando cubo OLAP:', error);
            document.getElementById('modalErrorGeneral')?.showModal();
            throw error;
        }
    };

    const guardarVistaCubo = async (parametros) => {
        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/guardar-vista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parametros)
            });

            if (!response.ok) {
                throw new Error('Error al guardar vista del cubo');
            }

            const data = await response.json();

            // Mostrar mensaje de éxito en textarea
            return {
                respuesta: `Vista "${data.nombreVista}" creada exitosamente.\n\n${data.message || 'La vista del cubo OLAP ha sido guardada y puede ser consultada desde la pestaña de consulta de cubos.'}`
            };
        } catch (error) {
            console.error('Error guardando vista del cubo:', error);
            throw error;
        }
    };

    const consultarVistaCubo = async (parametros) => {
        try {
            const response = await fetch('http://localhost:8080/api/cubo-olap/consultar-vista', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parametros)
            });

            if (!response.ok) {
                throw new Error('Error al consultar vista del cubo');
            }

            const data = await response.json();

            // Convertir el resultado al formato esperado
            if (data.filas && data.filas.length > 0) {
                return {
                    respuesta: JSON.stringify(data.filas)
                };
            } else {
                return {
                    respuesta: JSON.stringify([])
                };
            }
        } catch (error) {
            console.error('Error consultando vista del cubo:', error);
            throw error;
        }
    };

    // Wrapper functions para usar con las cards
    const manejarEjecucionCubo = async (parametros) => {
        console.log('=== INICIO manejarEjecucionCubo ===');
        console.log('Parámetros recibidos en manejarEjecucionCubo:', parametros);
        console.log('Campo filtro:', parametros.campoFiltro);

        const resultado = await ejecutarCuboOLAP(parametros);
        console.log('manejarEjecucionCubo - resultado:', resultado);

        // Procesar datos para la tabla global, pasando los parámetros del cubo
        console.log('Pasando parámetros a ejecutarConsultaConTabla:', parametros);
        await ejecutarConsultaConTabla(null, parametros.baseDatos, resultado, parametros);

        // Procesar datos para la card
        let datosParaCard = null;
        if (resultado && resultado.respuesta) {
            try {
                const filas = JSON.parse(resultado.respuesta);
                datosParaCard = {
                    filas: filas,
                    columnas: filas.length > 0 ? Object.keys(filas[0]) : []
                };
                console.log('Datos procesados para card:', datosParaCard);
            } catch (parseError) {
                console.error('Error al parsear datos para card:', parseError);
                datosParaCard = { filas: [], columnas: [] };
            }
        }

        console.log('=== FIN manejarEjecucionCubo ===');
        return datosParaCard;
    };

    const manejarGuardadoVista = async (parametros) => {
        const resultado = await guardarVistaCubo(parametros);
        await mostrarEnTextarea(resultado);
        return resultado;
    };

    const manejarConsultaVista = async (parametros) => {
        const resultado = await consultarVistaCubo(parametros);
        console.log('manejarConsultaVista - resultado:', resultado);
        console.log('manejarConsultaVista - parámetros recibidos:', parametros);

        // Crear un objeto de parámetros simulado del cubo usando el campoFiltro de la vista
        const parametrosCuboSimulado = parametros.campoFiltro ? {
            campoFiltro: parametros.campoFiltro
        } : null;

        console.log('Parámetros del cubo simulado para consulta de vista:', parametrosCuboSimulado);

        // Pasar los parámetros simulados para que se pueda excluir el campo filtro
        // Y marcar como consulta de vista de cubo para activar la agrupación
        await ejecutarConsultaConTabla(null, parametros.baseDatos, resultado, parametrosCuboSimulado, true);

        // Procesar datos para la card
        let datosParaCard = null;
        if (resultado && resultado.respuesta) {
            try {
                const filas = JSON.parse(resultado.respuesta);
                datosParaCard = {
                    filas: filas,
                    columnas: filas.length > 0 ? Object.keys(filas[0]) : []
                };
                console.log('Datos procesados para card consulta vista:', datosParaCard);
            } catch (parseError) {
                console.error('Error al parsear datos para card consulta vista:', parseError);
                datosParaCard = { filas: [], columnas: [] };
            }
        }

        return datosParaCard;
    };

    const renderContenido = () => {
        switch (pestanaActiva) {
            case 'bases-datos':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearBaseCard onCrearBase={crearBase} />
                        <EliminarBaseCard onEliminarBase={eliminarBase} />
                        <ListarBasesCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                ); case 'tablas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearTablaCard />
                        <EliminarTablaCard />
                        <InsertarDatosCard />
                        <ListarTablasCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                );
            case 'vistas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearVistaCard />
                        <EliminarVistaCard />
                        <EjecutarVistaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <ListarVistasCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                );
            case 'procedures':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearProcedureCard />
                        <EliminarProcedureCard />
                        <EjecutarProcedureCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <ListarProceduresCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                );
            case 'consultas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <ConsultaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <ConsultaPersonalizadaCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <DatosCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                );
            case 'datawarehouse':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CrearDataWarehouseCard onMostrarEnTextarea={mostrarEnTextarea} />
                        <ListarDataWarehousesCard onMostrarEnTextarea={mostrarEnTextarea} />
                        <EliminarDataWarehouseCard />
                        <ConsultarDataWarehouseCard onEjecutarConsulta={ejecutarConsultaConTabla} />
                        <CrearDataMartCard onMostrarEnTextarea={mostrarEnTextarea} />
                    </div>
                );
            case 'cubo-olap':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <CuboOLAPCard
                            onEjecutarCuboOLAP={manejarEjecucionCubo}
                            onGuardarVistaCubo={manejarGuardadoVista}
                        />
                        <ConsultarCuboOLAPCard
                            onConsultarVistaCubo={manejarConsultaVista}
                        />
                    </div>
                );
            default:
                return <div className="text-center text-gray-500 mt-8">Selecciona una categoría del menú lateral</div>;
        }
    };

    const navegarA = (pestaña) => {
        setPestanaActiva(pestaña);
        setDatosTabla([]);
        setColumnasTabla([]);
        setConsultaEjecutada(false);
        setMostrarTabla(false);
        document.getElementById('sidebar-drawer').checked = false;
    }; const renderResultados = () => {
        const deberiasMostrarTabla = mostrarTabla && (pestanaActiva === 'consultas' || pestanaActiva === 'vistas' || pestanaActiva === 'procedures' || pestanaActiva === 'datawarehouse' || pestanaActiva === 'cubo-olap');

        console.log('renderResultados:', {
            deberiasMostrarTabla,
            mostrarTabla,
            pestanaActiva,
            columnasTabla: columnasTabla.length,
            datosTabla: datosTabla.length
        });

        if (deberiasMostrarTabla) {
            return (
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table table-xs table-pin-rows table-pin-cols">
                        <thead>
                            <tr>
                                <th></th>
                                {columnasTabla.length > 0 ? (
                                    columnasTabla.map((columna, index) => {
                                        // Detectar si es la columna TOTAL
                                        const esColumnaTotales = columna === '';
                                        // Para cubo OLAP, ocultar el nombre de la primera columna (dimensión X)
                                        const esPrimeraColumnaOLAP = index === 0 && pestanaActiva === 'cubo-olap';
                                        const textoColumna = esPrimeraColumnaOLAP ? '' : columna;

                                        return (
                                            <td
                                                key={index}
                                                className={esColumnaTotales ? 'font-bold text-accent-content border-l-2 border-accent' : ''}
                                            >
                                                {textoColumna}
                                            </td>
                                        );
                                    })
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
                                datosTabla.map((fila, index) => {
                                    // Detectar si es la fila de totales (última fila y contiene valores vacíos)
                                    const esFilaTotales = index === datosTabla.length - 1 &&
                                        Object.values(fila).some(valor => valor === '' || (typeof valor === 'string' && valor.trim() === ''));

                                    return (
                                        <tr key={index} className={esFilaTotales ? 'border-t-2 border-primary' : ''}>
                                            <th>{''}</th>
                                            {columnasTabla.length > 0 ? (columnasTabla.map((columna, colIndex) => {
                                                // Detectar si es la columna TOTAL
                                                const esColumnaTotales = columna === '';
                                                // Combinar estilos para fila de totales y columna de totales
                                                let className = 'text-sm';

                                                if (esFilaTotales && esColumnaTotales) {
                                                    // Celda gran total (esquina inferior derecha)
                                                    className += ' font-black text-accent bg-accent/20 border-l-2 border-accent';
                                                } else if (esFilaTotales) {
                                                    // Fila de totales
                                                    className += ' font-bold text-primary';
                                                } else if (esColumnaTotales) {
                                                    // Columna de totales
                                                    className += ' font-bold text-accent border-l-2 border-accent';
                                                }

                                                return (
                                                    <td className={className} key={colIndex}>
                                                        {(esFilaTotales || esColumnaTotales) && typeof fila[columna] === 'number'
                                                            ? fila[columna].toLocaleString()
                                                            : ((esFilaTotales && colIndex === 0 && pestanaActiva === 'cubo-olap') ? '' : (fila[columna] || '0'))
                                                        }
                                                    </td>
                                                );
                                            })
                                            ) : (
                                                Object.values(fila).map((valor, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className={esFilaTotales ? 'font-bold text-primary' : ''}>
                                                        {esFilaTotales && typeof valor === 'number'
                                                            ? valor.toLocaleString()
                                                            : (valor || '-')
                                                        }
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    );
                                })) : (
                                <tr>
                                    <th>-</th>
                                    <td className='text-sm' colSpan={columnasTabla.length > 0 ? columnasTabla.length : 3}>
                                        {consultaEjecutada
                                            ? "No se encontraron datos para esta consulta"
                                            : "Los resultados de las consultas aparecerán aquí..."
                                        }
                                    </td>
                                    <th>-</th>
                                </tr>
                            )}
                        </tbody>
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
            case 'datawarehouse': return 'Gestión de Data Warehouse';
            case 'cubo-olap': return 'Cubo OLAP - Análisis Multidimensional';
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
        },
        {
            id: 'datawarehouse',
            titulo: 'Data Warehouse',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: 'cubo-olap',
            titulo: 'Cubo OLAP',
            icono: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
