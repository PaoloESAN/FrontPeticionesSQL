import React, { useState, useEffect } from 'react'

export default function Cards({ crearBase, eliminar, ejecutarConsulta }) {
    const [basesDatos, setBasesDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOperating, setIsOperating] = useState(false);

    const obtenerBasesDatos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8080/api/listarBases');
            if (response.ok) {
                const data = await response.json(); // Cambiado a json()
                console.log('Bases de datos obtenidas:', data);
                setBasesDatos(Array.isArray(data) ? data : []); // Aseguramos que sea un array
            } else {
                console.error('Error en la respuesta:', response.status);
            }
        } catch (error) {
            console.error('Error al obtener bases de datos:', error);
        } finally {
            setIsLoading(false);
        }
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
            </div>
            <div className="card w-96 card-md shadow-lg bg-indigo-900">
                <div className="card-body space-y-4">
                    <h2 className="card-title">Ejecutar consulta:</h2>
                    <div className='flex flex-row gap-2 items-center'>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-accent"
                            id='baseDatosConsulta'
                        />
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn m-1 btn-soft btn-accent rounded-3xl">
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
                    </div>
                    <input
                        type="text"
                        placeholder="consulta sql"
                        className="input input-accent"
                        id='consultaSql'
                    />

                    <div className="justify-end card-actions">
                        <button
                            className="btn btn-soft btn-accent"
                            onClick={() => ejecutarConsulta()}
                        >
                            Ejecutar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
