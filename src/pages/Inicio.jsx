import React from 'react'
import Navbar from '../components/Navbar'
import Cards from '../components/Cards'
import { ModalCrearBase, ModalEliminarBase, ModalConsultaBase } from '../components/AllModal'
import { useBaseDatos } from '../hooks/useBaseDatos'

export default function Inicio() {
    const { crearBase, eliminarBase, ejecutarConsulta } = useBaseDatos();

    return (
        <>
            <header className='fixed w-full z-50'>
                <Navbar></Navbar>
            </header>
            <br />
            <p className='text-2xl ml-8 mt-18'>Administrar base de datos: </p>
            <br />
            <Cards
                crearBase={crearBase}
                eliminar={eliminarBase}
                ejecutarConsulta={ejecutarConsulta}
            />
            <ModalCrearBase />
            <ModalEliminarBase />
            <ModalConsultaBase />
            <div className='ml-8 mt-10 mr-10 mb-10'>
                <textarea
                    id='resultadoConsulta'
                    placeholder="Resultado"
                    className="h-60 textarea textarea-primary w-full text-xl"
                    disabled />
            </div>
        </>
    )
}
