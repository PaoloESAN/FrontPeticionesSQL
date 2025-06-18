import React from 'react'
import Modal from './Modal'

export function ModalCrearBase() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Conexión", idModal: "modalCrearError",
                mensaje: "No se pudo conectar con el servidor. Verifica que la API esté funcionando."
            }} />
            <Modal objeto={{
                titulo: "Error al crear la base de datos", idModal: "modalCrearErrorBase",
                mensaje: "No se pudo crear la base de datos. Verifica que el nombre sea válido y que no exista una base de datos con ese nombre."
            }} />
            <Modal color="text-green-600" objeto={{
                titulo: "Creado Correctamente", idModal: "modalCrearOk",
                mensaje: "Se ha creado la base de datos correctamente."
            }} />
        </>
    )
}
export function ModalEliminarBase() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Conexión", idModal: "modalEliminarError",
                mensaje: "No se pudo conectar con el servidor. Verifica que la API esté funcionando."
            }} />
            <Modal objeto={{
                titulo: "Error al eliminar la base de datos", idModal: "modalEliminarErrorBase",
                mensaje: "No se pudo eliminar la base de datos. Verifica que el nombre sea válido y que no exista una base de datos con ese nombre."
            }} />
            <Modal color="text-green-600" objeto={{
                titulo: "Eliminado Correctamente", idModal: "modalEliminarOk",
                mensaje: "Se ha eliminado la base de datos correctamente."
            }} />
        </>
    )
}
export function ModalConsultaBase() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Conexión", idModal: "modalConsultaError",
                mensaje: "No se pudo conectar con el servidor. Verifica que la API esté funcionando."
            }} />
            <Modal objeto={{
                titulo: "Error al hacer la consulta a la base de datos", idModal: "modalConsultaErrorBase",
                mensaje: "Verifica la consulta SQL."
            }} />
            <Modal color="text-green-600" objeto={{
                titulo: "Consulta ejecutada correctamente", idModal: "modalConsultaOk",
                mensaje: "Se ha ejecutado la consulta a la base de datos correctamente."
            }} />
        </>
    )
}
export function ModalCrearTabla() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Validación", idModal: "modalCrearTablaErrorValidacion",
                mensaje: "Por favor, verifica que hayas ingresado el nombre de la tabla y al menos una columna."
            }} />
            <Modal objeto={{
                titulo: "Error de Conexión", idModal: "modalCrearTablaError",
                mensaje: "No se pudo conectar con el servidor. Verifica que la API esté funcionando."
            }} />
            <Modal objeto={{
                titulo: "Error al crear la tabla", idModal: "modalCrearTablaErrorBase",
                mensaje: "No se pudo crear la tabla. Revisa los datos e intenta nuevamente."
            }} />
            <Modal color="text-green-600" objeto={{
                titulo: "Tabla Creada Correctamente", idModal: "modalCrearTablaOk",
                mensaje: "Se ha creado la tabla exitosamente."
            }} />
        </>
    )
}

export function ModalEliminarTabla() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Validación", idModal: "modalEliminarTablaErrorValidacion",
                mensaje: "Por favor, selecciona una base de datos y una tabla."
            }} />
            <Modal objeto={{
                titulo: "Error de Conexión", idModal: "modalEliminarTablaError",
                mensaje: "No se pudo conectar con el servidor. Verifica que la API esté funcionando."
            }} />
            <Modal objeto={{
                titulo: "Error al eliminar la tabla", idModal: "modalEliminarTablaErrorBase",
                mensaje: "No se pudo eliminar la tabla. Verifica que la tabla exista y no tenga dependencias."
            }} />
            <Modal color="text-green-600" objeto={{
                titulo: "Tabla Eliminada Correctamente", idModal: "modalEliminarTablaOk",
                mensaje: "Se ha eliminado la tabla exitosamente."
            }} />
            {/* Modal de confirmación personalizado */}
            <ModalConfirmarEliminarTabla />
        </>
    )
}

// Modal de confirmación personalizado para eliminar tabla
function ModalConfirmarEliminarTabla() {
    const cerrarModal = () => {
        document.getElementById('modalConfirmarEliminarTabla').close();
    };

    return (
        <dialog id="modalConfirmarEliminarTabla" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-yellow-600">⚠️ Confirmar Eliminación</h3>
                <div className="py-4">
                    <p className="mb-2">¿Estás seguro de que deseas eliminar esta tabla?</p>
                    <div className="flex flex-row gap-5">
                        <p className="text-x1">
                            <strong>Base de datos:</strong> <span className='text-amber-400' id="confirmarBaseDatos"></span>
                        </p>
                        <p className="text-x1">
                            <strong>Tabla:</strong> <span className='text-amber-400' id="confirmarTabla"></span>
                        </p>
                    </div>
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-outline"
                        onClick={cerrarModal}
                    >
                        Cancelar
                    </button>
                    <button
                        id="btnConfirmarEliminar"
                        className="btn btn-error"
                    >
                        Eliminar Tabla
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export function ModalConsultaPersonalizada() {
    return (
        <>
            <Modal objeto={{
                titulo: "Error de Validación", idModal: "modalConsultaPersonalizadaErrorValidacion",
                mensaje: "Por favor, selecciona una base de datos y escribe una consulta SQL."
            }} />
            <Modal objeto={{
                titulo: "Error al ejecutar consulta", idModal: "modalConsultaPersonalizadaError",
                mensaje: "Error al ejecutar la consulta. Verifica la sintaxis SQL."
            }} />
        </>
    )
}
