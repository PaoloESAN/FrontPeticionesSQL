import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import { useBasesDatos } from '../../context/BaseDatosContext';
import { ModalEliminarBase } from '../AllModal';

export default function EliminarBaseCard({ onEliminarBase }) {
    const [isOperating, setIsOperating] = useState(false);
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const { refrescarBasesDatos } = useBasesDatos();

    const handleEliminar = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEliminarErrorBase').showModal();
            return;
        }

        document.getElementById('modalConfirmarEliminarBase').showModal();
    };

    const confirmarEliminacion = async () => {
        document.getElementById('modalConfirmarEliminarBase').close();

        setIsOperating(true);
        try {
            await onEliminarBase(baseDatosSeleccionada);
            setBaseDatosSeleccionada('');
            refrescarBasesDatos();
        } finally {
            setIsOperating(false);
        }
    };

    const cancelarEliminacion = () => {
        document.getElementById('modalConfirmarEliminarBase').close();
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Eliminar base de datos:</h2>
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={setBaseDatosSeleccionada}
                        placeholder="Selecciona base de datos"
                        className="select select-secondary flex-1"
                    />
                </div>
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-secondary"
                        onClick={handleEliminar}
                        disabled={isOperating || !baseDatosSeleccionada}
                    >
                        {isOperating ? 'Eliminando...' : 'Eliminar'}
                    </button>                </div>
            </div>

            <ModalEliminarBase />

            {/* Modal de confirmación */}
            <dialog id="modalConfirmarEliminarBase" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Confirmar eliminación</h3>
                    <p className="py-4">
                        ¿Estás seguro de que quieres eliminar la base de datos "{baseDatosSeleccionada}"?
                        <br />
                        <span className="text-warning font-semibold">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="modal-action">
                        <button
                            className="btn btn-ghost"
                            onClick={cancelarEliminacion}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-error"
                            onClick={confirmarEliminacion}
                            disabled={isOperating}
                        >
                            {isOperating ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
