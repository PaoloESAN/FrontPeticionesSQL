import React, { useState } from 'react';
import BaseDatosSelector from './BaseDatosSelector';

export default function CrearTablaCard() {
    const [baseDatosSeleccionada, setBaseDatosSeleccionada] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const notificarCambioTablas = () => {
        // Enviar evento personalizado para notificar que las tablas han cambiado
        window.dispatchEvent(new CustomEvent('tablasActualizadas', {
            detail: { baseDatos: baseDatosSeleccionada }
        }));
    };

    const handleOpenModal = () => {
        if (!baseDatosSeleccionada) {
            alert('Por favor, selecciona una base de datos primero');
            return;
        }
        document.getElementById('modalCrearTabla').showModal();
    };

    return (
        <div className="card w-96 card-md shadow-lg bg-indigo-900">
            <div className="card-body space-y-4">
                <h2 className="card-title text-white">Crear tabla:</h2>

                {/* Selector de base de datos */}
                <div className='flex flex-row gap-2 items-center'>
                    <BaseDatosSelector
                        value={baseDatosSeleccionada}
                        onBaseDatosChange={setBaseDatosSeleccionada}
                        placeholder="Selecciona base de datos"
                        className="select select-info flex-1"
                    />
                </div>

                {/* Botón para abrir modal */}
                <div className="justify-end card-actions">
                    <button
                        className="btn btn-soft btn-info"
                        onClick={handleOpenModal}
                        disabled={isCreating || !baseDatosSeleccionada}
                    >
                        {isCreating ? 'Creando...' : 'Crear Tabla'}
                    </button>
                </div>
            </div>            {/* Modal para crear tabla */}
            <ModalCrearTabla
                baseDatos={baseDatosSeleccionada}
                setIsCreating={setIsCreating}
                onTablaCreada={notificarCambioTablas}
            />
        </div>
    );
}

// Componente Modal separado
function ModalCrearTabla({ baseDatos, setIsCreating, onTablaCreada }) {
    const [nombreTabla, setNombreTabla] = useState('');
    const [columnas, setColumnas] = useState([
        { nombre: '', tipo: 'VARCHAR(255)' }
    ]);

    const tiposDato = [
        'VARCHAR(255)',
        'INT',
        'BIGINT',
        'TEXT',
        'DATE',
        'DATETIME',
        'BOOLEAN',
        'DECIMAL(10,2)',
        'FLOAT',
        'DOUBLE'
    ];

    const agregarColumna = () => {
        setColumnas([...columnas, { nombre: '', tipo: 'VARCHAR(255)' }]);
    };

    const eliminarColumna = (index) => {
        if (columnas.length > 1) {
            setColumnas(columnas.filter((_, i) => i !== index));
        }
    };

    const actualizarColumna = (index, campo, valor) => {
        const nuevasColumnas = [...columnas];
        nuevasColumnas[index][campo] = valor;
        setColumnas(nuevasColumnas);
    };

    const crearTabla = async () => {
        // Validaciones
        if (!nombreTabla.trim()) {
            alert('Por favor, ingresa un nombre para la tabla');
            return;
        }

        const columnasValidas = columnas.filter(col => col.nombre.trim() !== '');
        if (columnasValidas.length === 0) {
            alert('Por favor, agrega al menos una columna con nombre');
            return;
        }

        setIsCreating(true);

        try {
            // Construir la consulta SQL
            const columnasSQL = columnasValidas
                .map(col => `${col.nombre.trim()} ${col.tipo}`)
                .join(', ');

            const consultaSQL = `CREATE TABLE ${nombreTabla.trim()} (${columnasSQL})`;

            console.log('Creando tabla con SQL:', consultaSQL);

            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatos}&sql=${encodeURIComponent(consultaSQL)}`, {
                method: 'POST',
            }); if (response.ok) {
                // Limpiar formulario
                setNombreTabla('');
                setColumnas([{ nombre: '', tipo: 'VARCHAR(255)' }]);

                // Cerrar modal
                document.getElementById('modalCrearTabla').close();

                // Notificar que se creó una tabla para refrescar selectores
                if (onTablaCreada) {
                    onTablaCreada();
                }

                // Mostrar éxito
                alert('¡Tabla creada exitosamente!');
            } else {
                const errorData = await response.json();
                console.error('Error al crear tabla:', errorData);
                alert('Error al crear la tabla. Revisa los datos e intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsCreating(false);
        }
    };

    const cancelar = () => {
        setNombreTabla('');
        setColumnas([{ nombre: '', tipo: 'VARCHAR(255)' }]);
        document.getElementById('modalCrearTabla').close();
    };

    return (
        <dialog id="modalCrearTabla" className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Crear Nueva Tabla</h3>

                {/* Información de base de datos */}
                <div className="mb-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-600">Base de datos: <strong>{baseDatos}</strong></p>
                </div>

                {/* Nombre de la tabla */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Nombre de la tabla:</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: usuarios, productos, etc."
                        className="input input-bordered w-full"
                        value={nombreTabla}
                        onChange={(e) => setNombreTabla(e.target.value)}
                    />
                </div>

                {/* Columnas */}
                <div className="form-control mb-4">
                    <label className="label">
                        <span className="label-text font-semibold">Columnas:</span>
                    </label>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {columnas.map((columna, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Nombre columna"
                                    className="input input-bordered flex-1"
                                    value={columna.nombre}
                                    onChange={(e) => actualizarColumna(index, 'nombre', e.target.value)}
                                />
                                <select
                                    className="select select-bordered w-40"
                                    value={columna.tipo}
                                    onChange={(e) => actualizarColumna(index, 'tipo', e.target.value)}
                                >
                                    {tiposDato.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-error btn-sm"
                                    onClick={() => eliminarColumna(index)}
                                    disabled={columnas.length === 1}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline btn-sm mt-2"
                        onClick={agregarColumna}
                    >
                        + Agregar Columna
                    </button>
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
                        onClick={crearTabla}
                    >
                        Crear Tabla
                    </button>
                </div>
            </div>
        </dialog>
    );
}
