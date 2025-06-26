import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function CrearProcedureCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const notificarCambioProcedures = () => {
        // Enviar evento personalizado para notificar que los procedures han cambiado
        window.dispatchEvent(new CustomEvent('proceduresActualizados', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    };

    const handleOpenModal = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalCrearProcedureErrorValidacion').showModal();
            return;
        }
        document.getElementById('modalCrearProcedure').showModal();
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Crear Procedure:</h2>

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
                        className="btn btn-soft btn-secondary"
                        onClick={handleOpenModal}
                        disabled={isCreating || !baseDatosSeleccionada}
                    >
                        {isCreating ? 'Creando...' : 'Crear Procedure'}
                    </button>
                </div>
            </div>

            {/* Modal para crear procedure */}
            <ModalCrearProcedureFormulario
                baseDatos={baseDatosSeleccionada}
                setIsCreating={setIsCreating}
                onProcedureCreado={notificarCambioProcedures}
            />
            <ModalCrearProcedureErrores />
        </div>
    );
}

// Componente Modal separado
function ModalCrearProcedureFormulario({ baseDatos, setIsCreating, onProcedureCreado }) {
    const [nombreProcedure, setNombreProcedure] = useState('');
    const [scriptSQL, setScriptSQL] = useState('');

    const crearProcedure = async () => {
        // Validaciones
        if (!nombreProcedure.trim()) {
            document.getElementById('modalCrearProcedureErrorValidacion').showModal();
            return;
        }

        if (!scriptSQL.trim()) {
            document.getElementById('modalCrearProcedureErrorValidacion').showModal();
            return;
        }

        setIsCreating(true);

        try {
            // Construir el script completo del procedure
            const scriptCompleto = `CREATE PROCEDURE ${nombreProcedure}\n${scriptSQL}`;

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatos}&sql=${encodeURIComponent(scriptCompleto)}`, {
                method: 'POST',
            });

            if (response.ok) {
                setNombreProcedure('');
                setScriptSQL('');

                document.getElementById('modalCrearProcedure').close();

                onProcedureCreado();

                document.getElementById('modalCrearProcedureOk').showModal();

                const textarea = document.getElementById('resultadoConsulta');
                if (textarea) {
                    textarea.value = `✅ Procedure "${nombreProcedure}" creado correctamente`;
                }
            } else {
                const errorData = await response.text();

                const textarea = document.getElementById('resultadoConsulta');
                if (textarea) {
                    textarea.value = `❌ Error al crear procedure: ${errorData}`;
                }

                document.getElementById('modalCrearProcedureErrorServidor').showModal();
            }
        } catch (error) {
            console.error('Error al crear procedure:', error);

            // Mostrar error en textarea
            const textarea = document.getElementById('resultadoConsulta');
            if (textarea) {
                textarea.value = `❌ Error de conexión: ${error.message}`;
            }

            document.getElementById('modalCrearProcedureError').showModal();
        } finally {
            setIsCreating(false);
        }
    };

    const cancelar = () => {
        document.getElementById('modalCrearProcedure').close();
    };

    return (
        <dialog id="modalCrearProcedure" className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Crear Stored Procedure</h3>

                {/* Información de base de datos */}
                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Base de datos: <strong>{baseDatos}</strong>
                    </p>
                </div>

                {/* Formulario */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Nombre del Procedure:</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: sp_ObtenerUsuarios"
                        className="input input-bordered w-full"
                        value={nombreProcedure}
                        onChange={(e) => setNombreProcedure(e.target.value)}
                    />
                </div>

                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Script SQL del Procedure:</span>
                    </label>
                    <textarea
                        placeholder={`Ej:\nAS\nBEGIN\n    SELECT * FROM usuarios;\nEND`}
                        className="textarea textarea-bordered h-40 w-full font-mono text-sm"
                        value={scriptSQL}
                        onChange={(e) => setScriptSQL(e.target.value)}
                    />
                    <div className="label">
                        <span className="label-text-alt text-gray-500">
                            Escribe solo el cuerpo del procedure (sin CREATE PROCEDURE nombre)
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
                        className="btn btn-secondary"
                        onClick={crearProcedure}
                        disabled={!nombreProcedure.trim() || !scriptSQL.trim()}
                    >
                        Crear Procedure
                    </button>
                </div>
            </div>
        </dialog>
    );
}

// Componente con todos los modales de error
function ModalCrearProcedureErrores() {
    return (
        <>
            {/* Error: Validación */}
            <dialog id="modalCrearProcedureErrorValidacion" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error de Validación</h3>
                    <p className="py-4">Por favor, selecciona una base de datos y completa todos los campos.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error del servidor */}
            <dialog id="modalCrearProcedureErrorServidor" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error del Servidor</h3>
                    <p className="py-4">Ocurrió un error al crear el procedure. Verifica el script SQL.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error general */}
            <dialog id="modalCrearProcedureError" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error de Conexión</h3>
                    <p className="py-4">No se pudo conectar con el servidor. Verifica tu conexión.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Cerrar</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Éxito */}
            <dialog id="modalCrearProcedureOk" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-success">¡Procedure Creado!</h3>
                    <p className="py-4">El stored procedure se creó correctamente en la base de datos.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-success">Aceptar</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    );
}
