import React, { useState, useEffect } from 'react'

export default function Cards({ crearBase, eliminar, ejecutarConsulta }) {
    const [basesDatos, setBasesDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOperating, setIsOperating] = useState(false); const [columna, setColumna] = useState('');
    const [tabla, setTabla] = useState('');
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tipoConsulta, setTipoConsulta] = useState('');
    const [tablas, setTablas] = useState([]);
    const [columnas, setColumnas] = useState([]);
    const [loadingTablas, setLoadingTablas] = useState(false);
    const [loadingColumnas, setLoadingColumnas] = useState(false); const obtenerBasesDatos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8080/api/listarBases');
            if (response.ok) {
                const data = await response.json();
                console.log('Bases de datos obtenidas:', data);
                setBasesDatos(Array.isArray(data) ? data : []);
            } else {
                console.error('Error en la respuesta:', response.status);
            }
        } catch (error) {
            console.error('Error al obtener bases de datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const obtenerTablas = async (nombreBase) => {
        try {
            setLoadingTablas(true);
            const response = await fetch(`http://localhost:8080/api/tablas?nombre=${nombreBase}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Tablas obtenidas:', data);
                setTablas(Array.isArray(data) ? data : []);
            } else {
                console.error('Error al obtener tablas:', response.status);
                setTablas([]);
            }
        } catch (error) {
            console.error('Error al obtener tablas:', error);
            setTablas([]);
        } finally {
            setLoadingTablas(false);
        }
    };

    const obtenerColumnas = async (nombreTabla, nombreBase) => {
        try {
            setLoadingColumnas(true);
            const response = await fetch(`http://localhost:8080/api/columnas?tabla=${nombreTabla}&bd=${nombreBase}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Columnas obtenidas:', data);
                setColumnas(Array.isArray(data) ? data : []);
            } else {
                console.error('Error al obtener columnas:', response.status);
                setColumnas([]);
            }
        } catch (error) {
            console.error('Error al obtener columnas:', error);
            setColumnas([]);
        } finally {
            setLoadingColumnas(false);
        }
    };

    const construirConsultaSQL = () => {
        const inputConsulta = document.getElementById('consultaSql');
        const consultaPersonalizada = inputConsulta?.value?.trim();

        if (consultaPersonalizada) {
            return consultaPersonalizada;
        }

        if (tipoConsulta === 'SELECT' && tabla && columna && baseDatosSeleccionada) {
            return `SELECT ${columna} FROM ${tabla}`;
        } else if (tipoConsulta === 'DELETE' && tabla && baseDatosSeleccionada) {
            return `DELETE FROM ${tabla}`;
        }

        return '';
    }; const ejecutarConsultaSQL = async () => {
        const consultaSQL = construirConsultaSQL();

        if (!consultaSQL) {
            alert('Por favor, completa los campos requeridos o escribe una consulta SQL personalizada');
            return;
        }

        console.log('Ejecutando consulta:', consultaSQL);
        console.log('Base de datos:', baseDatosSeleccionada);

        await ejecutarConsulta(consultaSQL, baseDatosSeleccionada);
    };

    useEffect(() => {

        obtenerBasesDatos();
    }, []);

    const elegirBase = (nombre) => {

        const inputBase = document.getElementById('eliminarBase');
        if (inputBase) {
            inputBase.value = nombre;
        }
    }
    return (
        <div className='flex flex-wrap gap-4 mt-4 ml-8'>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title">Crear base de datos:</h2>
                    <div className='flex flex-row gap-2 items-center'>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-primary"
                            id='crearBase'
                        />
                    </div>                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-primary" onClick={async () => {
                                setIsOperating(true);
                                try {
                                    await crearBase();
                                    await obtenerBasesDatos();
                                } finally {
                                    setIsOperating(false);
                                }
                            }}
                            disabled={isOperating}
                        >
                            Crear
                        </button>
                    </div>
                </div>
            </div>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title">Eliminar base de datos:</h2>
                    <div className='flex flex-row gap-2 items-center'>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-secondary"
                            id='eliminarBase'
                        />
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn m-1 btn-soft btn-secondary rounded-3xl">
                                {isLoading ? 'Cargando...' : 'Bases'}
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                {isLoading ? (
                                    <li><span className="text-gray-500">Cargando bases...</span></li>
                                ) : basesDatos.length > 0 ? (
                                    basesDatos.map((base, index) => (
                                        <li key={index}>
                                            <a onClick={() => elegirBase(base)}>{base}</a>
                                        </li>
                                    ))
                                ) : (
                                    <li><span className="text-gray-500">No hay bases de datos</span></li>
                                )}
                            </ul>
                        </div>
                    </div>                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-secondary" onClick={async () => {
                                setIsOperating(true);
                                try {
                                    await eliminar();
                                    await obtenerBasesDatos();
                                } finally {
                                    setIsOperating(false);
                                }
                            }}
                            disabled={isOperating}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title">Ejecutar consulta:</h2>
                    <div className='flex flex-row gap-2 items-center'>
                        <select
                            className="select select-accent"
                            id='consultaSelectBase'
                            onChange={(e) => {
                                const selectedBase = e.target.value;
                                setBaseDatosSeleccionada(selectedBase);
                                if (selectedBase && selectedBase !== 'Bases de datos') {
                                    obtenerTablas(selectedBase);
                                }
                                setTablas([]);
                                setColumnas([]);
                            }}
                        >
                            <option disabled selected>Bases de datos</option>
                            {isLoading ? (
                                <option disabled>Cargando bases...</option>
                            ) : basesDatos.length > 0 ? (
                                basesDatos.map((base, index) => (
                                    <option key={index} value={base}>
                                        {base}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No hay bases de datos</option>
                            )}
                        </select>
                    </div>
                    <div className='flex flex-row gap-2 items-center'>                        <select
                        className="select select-accent"
                        onChange={(e) => setTipoConsulta(e.target.value)}
                    >
                        <option disabled selected>Tipo de consulta</option>
                        <option value="SELECT">SELECT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                        <select
                            className="select select-accent"
                            onChange={(e) => {
                                const selectedTable = e.target.value;
                                setTabla(selectedTable);
                                if (selectedTable && selectedTable !== 'Tablas' && baseDatosSeleccionada) {
                                    obtenerColumnas(selectedTable, baseDatosSeleccionada);
                                }
                                setColumnas([]);
                            }}
                        >
                            <option disabled selected>Tablas</option>
                            {loadingTablas ? (
                                <option disabled>Cargando tablas...</option>
                            ) : tablas.length > 0 ? (
                                tablas.map((tabla, index) => (
                                    <option key={index} value={tabla}>
                                        {tabla}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    {baseDatosSeleccionada ? 'No hay tablas' : 'Selecciona una base de datos'}
                                </option>
                            )}
                        </select>
                        <select
                            className="select select-accent"
                            onChange={(e) => setColumna(e.target.value)}
                        >
                            <option disabled selected>Columnas</option>
                            <option value="*">* (Todas)</option>
                            {loadingColumnas ? (
                                <option disabled>Cargando columnas...</option>
                            ) : columnas.length > 0 ? (
                                columnas.map((columna, index) => (
                                    <option key={index} value={columna}>
                                        {columna}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    {tabla ? 'No hay columnas' : 'Selecciona una tabla'}
                                </option>
                            )}
                        </select>
                    </div>
                    <div className='flex flex-row gap-2 items-center'>
                        <input
                            type="text"
                            placeholder="consulta sql personalizada (opcional)"
                            className="input input-accent w-full"
                            id='consultaSql'
                        />
                    </div>
                    <div className="justify-end card-actions">                        <button
                        className="btn btn-soft btn-accent"
                        onClick={() => ejecutarConsultaSQL()}
                    >
                        Ejecutar
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
