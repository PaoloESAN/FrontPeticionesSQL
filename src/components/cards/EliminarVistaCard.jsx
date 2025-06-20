import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import VistaSelector from './VistaSelector';
import { ModalEliminarVista } from '../AllModal';

export default function EliminarVistaCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [vistaSeleccionada, setVistaSeleccionada] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const notificarCambioVistas = () => {
        // Enviar evento personalizado para notificar que las vistas han cambiado
        window.dispatchEvent(new CustomEvent('vistasActualizadas', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    };

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setVistaSeleccionada(''); // Limpiar vista cuando cambia la base
    };

    const handleVistaChange = (nuevaVista) => {
        setVistaSeleccionada(nuevaVista);
    };

    const mostrarConfirmacion = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEliminarVistaErrorValidacion').showModal();
            return;
        }

        if (!vistaSeleccionada) {
            document.getElementById('modalEliminarVistaErrorValidacion').showModal();
            return;
        }

        // Rellenar los datos en el modal de confirmación
        document.getElementById('confirmarBaseDatosVista').textContent = baseDatosSeleccionada;
        document.getElementById('confirmarVistaEliminar').textContent = vistaSeleccionada;

        // Configurar el botón de confirmación
        const btnConfirmar = document.getElementById('btnConfirmarEliminarVista');
        btnConfirmar.onclick = confirmarEliminacion;

        // Mostrar modal de confirmación
        document.getElementById('modalConfirmarEliminarVista').showModal();
    };

    const confirmarEliminacion = async () => {
        // Cerrar modal de confirmación
        document.getElementById('modalConfirmarEliminarVista').close();

        // Proceder con la eliminación
        await ejecutarEliminacion();
    };

    const ejecutarEliminacion = async () => {
        setIsDeleting(true);
        try {
            // Construir consulta SQL para eliminar vista
            const consultaSQL = `DROP VIEW ${vistaSeleccionada}`;

            console.log('Eliminando vista con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalEliminarVistaOk').showModal();

                // Limpiar selección de vista después del éxito
                setVistaSeleccionada('');

                // Notificar cambio en las vistas
                notificarCambioVistas();
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar vista:', errorData);
                document.getElementById('modalEliminarVistaErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalEliminarVistaError').showModal();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Eliminar vista:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={handleBaseDatosChange}
                        placeholder="Selecciona base de datos"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Selector de vistas */}
                <div className='flex flex-row gap-2 items-center'>
                    <VistaSelector
                        baseDatos={baseDatosSeleccionada}
                        value={vistaSeleccionada}
                        onVistaChange={handleVistaChange}
                        placeholder="Selecciona vista"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Botón para eliminar */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-error"
                        onClick={mostrarConfirmacion}
                        disabled={isDeleting || !baseDatosSeleccionada || !vistaSeleccionada}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar Vista'}
                    </button>
                </div>
            </div>

            <ModalEliminarVista />
        </div>
    );
}
