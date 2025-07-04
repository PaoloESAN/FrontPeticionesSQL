import React, { useState } from 'react';
import { useBasesDatos } from '../../context/BaseDatosContext';
import { ModalCrearBase } from '../AllModal';

export default function CrearBaseCard({ onCrearBase }) {
    const [isOperating, setIsOperating] = useState(false);
    const [nombreBase, setNombreBase] = useState('');
    const { refrescarBasesDatos } = useBasesDatos(); const handleCrear = async () => {
        if (!nombreBase.trim()) {
            document.getElementById('modalCrearErrorBase').showModal();
            return;
        }

        setIsOperating(true);
        try {
            await onCrearBase(nombreBase);
            setNombreBase('');
            refrescarBasesDatos();
        } finally {
            setIsOperating(false);
        }
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Crear base de datos:</h2>
                <div className='flex flex-row gap-2 items-center'>
                    <input
                        type="text"
                        placeholder="Nombre de la base de datos"
                        className="input input-primary w-full"
                        value={nombreBase}
                        onChange={(e) => setNombreBase(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCrear()}
                    />
                </div>
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-primary"
                        onClick={handleCrear}
                        disabled={isOperating || !nombreBase.trim()}
                    >
                        {isOperating ? 'Creando...' : 'Crear'}
                    </button>                </div>
            </div>

            <ModalCrearBase />
        </div>
    );
}
