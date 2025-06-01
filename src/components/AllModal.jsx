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
