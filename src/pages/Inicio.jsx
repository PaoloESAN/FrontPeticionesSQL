import React from 'react'
import Navbar from '../components/Navbar'

export default function Inicio() {
    const crearBase = async () => {
        const nombre = document.getElementById('crearBase').value;

        try {
            const response = await fetch(`http://localhost:8080/api/crearBase?nombre=${nombre}`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.text();
                alert(`Base de datos creada exitosamente: ${nombre}`);
                console.log(data);
            } else {
                alert('Error al crear la base de datos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    }
    const eliminar = () => {
        const nombre = document.getElementById('eliminarBase').value
        alert(`Base de datos creada: ${nombre}`);
    }
    const ejecutarConsulta = () => {
        const nombre = document.getElementById('baseDatosConsulta').value
        const consulta = document.getElementById('consultaSql').value
        alert(`Base de datos creada: ${nombre} con consulta: ${consulta}`);
    }
    return (
        <>
            <Navbar></Navbar>
            <br />
            <p className='text-2xl ml-8'>Administrar base de datos: </p>
            <br />
            <div className='flex flex-wrap gap-4 mt-4 ml-8'>
                <div className="card w-96 card-md shadow-lg bg-indigo-900">
                    <div className="card-body space-y-4">
                        <h2 className="card-title">Crear base de datos:</h2>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-primary"
                            id='crearBase'
                        />
                        <div className="justify-end card-actions">
                            <button
                                className="btn btn-soft btn-primary"
                                onClick={() => crearBase()}
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card w-96 card-md shadow-lg bg-indigo-900">
                    <div className="card-body space-y-4">
                        <h2 className="card-title">Eliminar base de datos:</h2>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-secondary"
                            id='eliminarBase'
                        />

                        <div className="justify-end card-actions">
                            <button
                                className="btn btn-soft btn-secondary"
                                onClick={() => eliminar()}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
                <div className="card w-96 card-md shadow-lg bg-indigo-900">
                    <div className="card-body space-y-4">
                        <h2 className="card-title">Ejecutar consulta:</h2>
                        <input
                            type="text"
                            placeholder="Base de datos"
                            className="input input-accent"
                            id='baseDatosConsulta'
                        />
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
        </>
    )
}
