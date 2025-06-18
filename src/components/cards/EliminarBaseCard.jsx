import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import { useBasesDatos } from '../../context/BaseDatosContext';
import { ModalEliminarBase } from '../AllModal';

export default function EliminarBaseCard({ onEliminarBase }) {
    const [isOperating, setIsOperating] = useState(false);
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const { refrescarBasesDatos } = useBasesDatos(); const handleEliminar = async () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEliminarErrorBase').showModal();
            return;
        }

        const confirmacion = window.confirm(
            `¿Estás seguro de que quieres eliminar la base de datos "${baseDatosSeleccionada}"?`
        );

        if (!confirmacion) return;

        setIsOperating(true);
        try {
            await onEliminarBase(baseDatosSeleccionada);
            setBaseDatosSeleccionada(''); // Limpiar selección
            // Refrescar la lista de bases de datos automáticamente
            refrescarBasesDatos();
        } finally {
            setIsOperating(false);
        }
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
        </div>
    );
}
