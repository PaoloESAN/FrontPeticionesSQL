import React from 'react'
import Navbar from '../components/Navbar'
import Cards from '../components/Cards'
import { ModalCrearBase, ModalEliminarBase, ModalConsultaBase } from '../components/AllModal'

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
    const ejecutarConsulta = async () => {
        const nombre = document.getElementById('consultaSelectBase').value;
        const consulta = document.getElementById('consultaSql').value;
        const resultado = document.getElementById('resultadoConsulta');
        console.log('Nombre de la base:', nombre);
        console.log('Consulta SQL:', consulta);

        try {
            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${nombre}&sql=${consulta}`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                resultado.value = data.respuesta;
                console.log('Consulta ejecutada:', data);
                document.getElementById('modalConsultaOk').showModal();
            } else {
                document.getElementById('modalConsultaErrorBase').showModal();
                const errorData = await response.json();
                console.error('Error en la consulta:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalConsultaError').showModal();
        }
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
            <ModalConsultaBase />
            <div className='text-2xl ml-8 mt-10 mr-10'>
                <textarea id='resultadoConsulta' placeholder="Resultado" className="textarea textarea-primary w-full" disabled></textarea>
            </div>
        </>
    )
}
