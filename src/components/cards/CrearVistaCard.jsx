import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import { ModalCrearVista } from '../AllModal';

export default function CrearVistaCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const notificarCambioVistas = () => {
        window.dispatchEvent(new CustomEvent('vistasActualizadas', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    };

    const handleOpenModal = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalCrearVistaErrorValidacion').showModal();
            return;
        }
        document.getElementById('modalCrearVista').showModal();
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Crear vista:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={setBaseDatosSeleccionada}
                        placeholder="Selecciona base de datos"
                        className="select select-primary flex-1"
                    />
                </div>

                {/* Botón para abrir modal */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-success"
                        onClick={handleOpenModal}
                        disabled={isCreating || !baseDatosSeleccionada}
                    >
                        {isCreating ? 'Creando...' : 'Crear Vista'}
                    </button>
                </div>
            </div>

            {/* Modal para crear vista */}
            <ModalCrearVistaFormulario
                baseDatos={baseDatosSeleccionada}
                setIsCreating={setIsCreating}
                onVistaCreada={notificarCambioVistas}
            />
            <ModalCrearVista />
        </div>
    );
}

function ModalCrearVistaFormulario({ baseDatos, setIsCreating, onVistaCreada }) {
    const [nombreVista, setNombreVista] = useState('');
    const [scriptSQL, setScriptSQL] = useState('');

    const crearVista = async () => {
        if (!nombreVista.trim()) {
            document.getElementById('modalCrearVistaErrorValidacion').showModal();
            return;
        }

        if (!scriptSQL.trim()) {
            document.getElementById('modalCrearVistaErrorValidacion').showModal();
            return;
        }

        setIsCreating(true);

        try {
            const consultaSQL = `CREATE VIEW ${nombreVista.trim()} AS ${scriptSQL.trim()}`;

            console.log('Creando vista con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatos}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                setNombreVista('');
                setScriptSQL('');

                document.getElementById('modalCrearVista').close();

                if (onVistaCreada) {
                    onVistaCreada();
                }

                document.getElementById('modalCrearVistaOk').showModal();
            } else {
                const errorData = await response.json();
                console.error('Error al crear vista:', errorData);
                document.getElementById('modalCrearVistaErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalCrearVistaError').showModal();
        } finally {
            setIsCreating(false);
        }
    };

    const cancelar = () => {
        setNombreVista('');
        setScriptSQL('');
        document.getElementById('modalCrearVista').close();
    };

    return (
        <dialog id="modalCrearVista" className="modal">
            <div className="modal-box w-11/12 max-w-4xl">
                <h3 className="font-bold text-lg mb-4">Crear Nueva Vista</h3>

                {/* Información de base de datos */}
                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-600">Base de datos: <strong>{baseDatos}</strong></p>
                </div>

                {/* Nombre de la vista */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Nombre de la vista:</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ejemplo: vista_usuarios, vista_ventas, etc."
                        className="input input-bordered w-full"
                        value={nombreVista}
                        onChange={(e) => setNombreVista(e.target.value)}
                    />
                </div>

                {/* Script SQL */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Script SQL (SELECT):</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered h-48 w-full font-mono text-sm"
                        placeholder="SELECT columna1, columna2, columna3
FROM tabla1
WHERE condicion
ORDER BY columna1;"
                        value={scriptSQL}
                        onChange={(e) => setScriptSQL(e.target.value)}
                    />
                    <div className="label">
                        <span className="label-text-alt text-info">
                            Solo escribe la consulta SELECT, no incluyas "CREATE VIEW"
                        </span>
                    </div>
                </div>

                {/* Botones */}
                <div className="modal-action">
                    <button
                        className="btn btn-error"
                        onClick={cancelar}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={crearVista}
                        disabled={!nombreVista.trim() || !scriptSQL.trim()}
                    >
                        Crear Vista
                    </button>
                </div>
            </div>
        </dialog>
    );
}
