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
    ConsultaCard,
    ConsultaPersonalizadaCard,
    DatosCard
} from '../components/cards/index.js'

export default function Inicio() {
    const { crearBase, eliminarBase, ejecutarConsulta } = useBaseDatos();
    const [pestanaActiva, setPestanaActiva] = useState('bases-datos');

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
                    </div>
                );
            case 'consultas':
                return (
                    <div className='flex flex-wrap gap-4'>
                        <ConsultaCard onEjecutarConsulta={ejecutarConsulta} />
                        <ConsultaPersonalizadaCard onEjecutarConsulta={ejecutarConsulta} />
                    </div>
                );
            default:
                return <div className="text-center text-gray-500 mt-8">Selecciona una categoría del menú lateral</div>;
        }
    };

    const navegarA = (pestaña) => {
        setPestanaActiva(pestaña);
        // Cerrar el drawer después de seleccionar
        document.getElementById('sidebar-drawer').checked = false;
    };

    const getTitulo = () => {
        switch (pestanaActiva) {
            case 'bases-datos': return 'Gestión de Bases de Datos';
            case 'tablas': return 'Gestión de Tablas';
            case 'vistas': return 'Gestión de Vistas';
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                <header className="sticky top-0">
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

                    {/* Textarea de resultados */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Resultados:</h2>
                        <textarea
                            id='resultadoConsulta'
                            placeholder="Los resultados de las consultas aparecerán aquí..."
                            className="h-60 textarea textarea-primary w-full text-lg"
                            disabled
                        />
                    </div>
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
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
