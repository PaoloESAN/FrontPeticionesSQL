import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import ProcedureSelector from './ProcedureSelector';
import { ModalEliminarProcedure } from '../AllModal';

export default function EliminarProcedureCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [procedureSeleccionado, setProcedureSeleccionado] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const notificarCambioProcedures = () => {
        // Enviar evento personalizado para notificar que los procedures han cambiado
        window.dispatchEvent(new CustomEvent('proceduresActualizados', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    };

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setProcedureSeleccionado('');
    };

    const handleProcedureChange = (nuevoProcedure) => {
        setProcedureSeleccionado(nuevoProcedure);
    };

    const mostrarConfirmacion = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEliminarProcedureErrorValidacion').showModal();
            return;
        }

        if (!procedureSeleccionado) {
            document.getElementById('modalEliminarProcedureErrorValidacion').showModal();
            return;
        }

        // Rellenar los datos en el modal de confirmación
        document.getElementById('confirmarBaseDatosProcedure').textContent = baseDatosSeleccionada;
        document.getElementById('confirmarProcedureEliminar').textContent = procedureSeleccionado;

        // Configurar el botón de confirmación
        const btnConfirmar = document.getElementById('btnConfirmarEliminarProcedure');
        btnConfirmar.onclick = confirmarEliminacion;

        // Mostrar modal de confirmación
        document.getElementById('modalConfirmarEliminarProcedure').showModal();
    };

    const confirmarEliminacion = async () => {
        // Cerrar modal de confirmación
        document.getElementById('modalConfirmarEliminarProcedure').close();

        // Proceder con la eliminación
        await ejecutarEliminacion();
    };

    const ejecutarEliminacion = async () => {
        setIsDeleting(true);
        try {
            // Construir consulta SQL para eliminar procedure
            const consultaSQL = `DROP PROCEDURE ${procedureSeleccionado}`;

            console.log('Eliminando procedure con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalEliminarProcedureOk').showModal();

                setProcedureSeleccionado('');

                notificarCambioProcedures();
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar procedure:', errorData);
                document.getElementById('modalEliminarProcedureErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalEliminarProcedureError').showModal();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Eliminar Procedure:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={handleBaseDatosChange}
                        placeholder="Selecciona base de datos"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Selector de procedures */}
                <div className='flex flex-row gap-2 items-center'>
                    <ProcedureSelector
                        baseDatos={baseDatosSeleccionada}
                        value={procedureSeleccionado}
                        onProcedureChange={handleProcedureChange}
                        placeholder="Selecciona procedure"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Botón para eliminar */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-error"
                        onClick={mostrarConfirmacion}
                        disabled={isDeleting || !baseDatosSeleccionada || !procedureSeleccionado}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar Procedure'}
                    </button>
                </div>
            </div>

            <ModalEliminarProcedure />
        </div>
    );
}
