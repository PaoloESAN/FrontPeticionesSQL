import React from 'react'
import Navbar from '../components/Navbar'
import Cards from '../components/Cards'
import { ModalCrearBase, ModalEliminarBase } from '../components/AllModal'

export default function Inicio() {
    const crearBase = async () => {
        const nombre = document.getElementById('crearBase').value;

        try {
            const response = await fetch(`http://localhost:8080/api/crearBase?nombre=${nombre}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalCrearOk').showModal();
            } else {
                document.getElementById('modalCrearErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalCrearError').showModal();
        }
    }
    const eliminar = async () => {
        const nombre = document.getElementById('eliminarBase').value;

        try {
            const response = await fetch(`http://localhost:8080/api/eliminarBase?nombre=${nombre}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalEliminarOk').showModal();
            } else {
                document.getElementById('modalEliminarErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalEliminarError').showModal();
        }
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
            <Cards crearBase={crearBase} eliminar={eliminar} ejecutarConsulta={ejecutarConsulta} />
            <ModalCrearBase />
            <ModalEliminarBase />
        </>
    )
}
