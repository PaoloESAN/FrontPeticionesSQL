import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import TablaSelector from './TablaSelector';
import { ModalEliminarTabla } from '../AllModal';

export default function EliminarTablaCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tablaSeleccionada, setTablaSeleccionada] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const notificarCambioTablas = () => {
        // Enviar evento personalizado para notificar que las tablas han cambiado
        window.dispatchEvent(new CustomEvent('tablasActualizadas', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    }; const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setTablaSeleccionada(''); // Limpiar tabla cuando cambia la base
    }; const handleTablaChange = (nuevaTabla) => {
        setTablaSeleccionada(nuevaTabla);
    };

    const mostrarConfirmacion = () => {
        if (!baseDatosSeleccionada) {
            document.getElementById('modalEliminarTablaErrorValidacion').showModal();
            return;
        }

        if (!tablaSeleccionada) {
            document.getElementById('modalEliminarTablaErrorValidacion').showModal();
            return;
        }

        // Rellenar los datos en el modal de confirmación
        document.getElementById('confirmarBaseDatos').textContent = baseDatosSeleccionada;
        document.getElementById('confirmarTabla').textContent = tablaSeleccionada;

        // Configurar el botón de confirmación
        const btnConfirmar = document.getElementById('btnConfirmarEliminar');
        btnConfirmar.onclick = confirmarEliminacion;

        // Mostrar modal de confirmación
        document.getElementById('modalConfirmarEliminarTabla').showModal();
    };

    const confirmarEliminacion = async () => {
        // Cerrar modal de confirmación
        document.getElementById('modalConfirmarEliminarTabla').close();

        // Proceder con la eliminación
        await ejecutarEliminacion();
    }; const ejecutarEliminacion = async () => {
        setIsDeleting(true);
        try {
            // Construir consulta SQL para eliminar tabla
            const consultaSQL = `DROP TABLE ${tablaSeleccionada}`;

            console.log('Eliminando tabla con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalEliminarTablaOk').showModal();

                // Limpiar selección de tabla después del éxito
                setTablaSeleccionada('');

                // Notificar cambio en las tablas
                notificarCambioTablas();
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar tabla:', errorData);
                document.getElementById('modalEliminarTablaErrorBase').showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalEliminarTablaError').showModal();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Eliminar tabla:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={handleBaseDatosChange}
                        placeholder="Selecciona base de datos"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Selector de tablas */}                <div className='flex flex-row gap-2 items-center'>
                    <TablaSelector
                        baseDatos={baseDatosSeleccionada}
                        value={tablaSeleccionada}
                        onTablaChange={handleTablaChange}
                        placeholder="Selecciona tabla"
                        className="select select-error flex-1"
                    />
                </div>

                {/* Botón para eliminar */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-error"
                        onClick={mostrarConfirmacion}
                        disabled={isDeleting || !baseDatosSeleccionada || !tablaSeleccionada}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar Tabla'}                    </button>
                </div>
            </div>

            <ModalEliminarTabla />
        </div>
    );
}
