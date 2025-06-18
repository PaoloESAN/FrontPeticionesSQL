import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';
import TablaSelector from './TablaSelector';

export default function EliminarTablaCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [tablaSeleccionada, setTablaSeleccionada] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleBaseDatosChange = (nuevaBase) => {
        setBaseDatosSeleccionada(nuevaBase);
        setTablaSeleccionada(''); // Limpiar tabla cuando cambia la base
    };

    const handleTablaChange = (nuevaTabla) => {
        setTablaSeleccionada(nuevaTabla);
    };

    const handleEliminar = async () => {
        if (!baseDatosSeleccionada) {
            alert('Por favor, selecciona una base de datos');
            return;
        }

        if (!tablaSeleccionada) {
            alert('Por favor, selecciona una tabla');
            return;
        }

        // Confirmación antes de eliminar
        const confirmacion = window.confirm(
            `¿Estás seguro de que deseas eliminar la tabla "${tablaSeleccionada}" de la base de datos "${baseDatosSeleccionada}"?\n\nEsta acción no se puede deshacer y se perderán todos los datos de la tabla.`
        );

        if (!confirmacion) return;

        setIsDeleting(true);
        try {
            // Construir consulta SQL para eliminar tabla
            const consultaSQL = `DROP TABLE ${tablaSeleccionada}`;

            console.log('Eliminando tabla con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            });

            if (response.ok) {
                alert(`¡Tabla "${tablaSeleccionada}" eliminada exitosamente!`);

                // Limpiar selección de tabla después del éxito
                setTablaSeleccionada('');
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar tabla:', errorData);
                alert('Error al eliminar la tabla. Verifica que la tabla exista y no tenga dependencias.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Intenta nuevamente.');
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

                {/* Selector de tablas */}
                <div className='flex flex-row gap-2 items-center'>
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
                        onClick={handleEliminar}
                        disabled={isDeleting || !baseDatosSeleccionada || !tablaSeleccionada}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar Tabla'}
                    </button>
                </div>
            </div>
        </div>
    );
}
