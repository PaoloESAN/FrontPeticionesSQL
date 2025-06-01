import React from 'react'
import './Modal.css'
export default function Modal({ objeto, color = "text-red-500" }) {
    return (
        <dialog id={objeto.idModal} className="modal">
            <div className="modal-box">
                <h3 className={`font-bold text-lg ${color}`}>{objeto.titulo}</h3>
                <p className="py-4">{objeto.mensaje}</p>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    )
}
