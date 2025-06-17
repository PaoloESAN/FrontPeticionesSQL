import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconoSQL from '../assets/SQlicon.png';

export default function Login() {

    const [sqlAuth, setSqlAuth] = useState(false);
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const Navigate = useNavigate();
    const iniciarSesion = () => {
        if (sqlAuth) {
            if (usuario === '' || contrasena === '') {
                document.getElementById('vacio').showModal();
                return;
            }
            else if (usuario === 'sa' && contrasena === '123456789') {
                Navigate('/inicio');
                return;
            }
            else {
                document.getElementById('errorDatos').showModal();
                return;
            }
        } else {
            Navigate('/inicio');
        }
    }

    return (
        <div class="flex min-h-full flex-col justify-center px-6 py-25 lg:px-8">

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white rounded-lg p-6 shadow-lg">
                <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img class="mx-auto h-20 w-20"
                        src={iconoSQL}
                        alt="DataBaseFix" />
                    <h2 class="mb-5 mt-5 text-center text-2xl/9 font-bold tracking-tight text-black">Base de datos</h2>
                </div>
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm/6 font-medium text-black">Autenticación</label>
                        <select onChange={(e) => setSqlAuth(e.target.value === 'Windows Authentication' ? false : true)}
                            defaultValue="Windows Authentication"
                            className="w-full select select-primary bg-white text-black">
                            <option>Windows Authentication</option>
                            <option>SQL Server Authentication</option>
                        </select>
                    </div>
                    {sqlAuth ? (
                        <>
                            <div>
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm/6 font-medium text-black">Usuario</label>
                                </div>
                                <div class="mt-2">
                                    <input value={usuario} onChange={(e) => setUsuario(e.target.value)} type="text" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm/6 font-medium text-black">Contraseña</label>
                                </div>
                                <div class="mt-2">
                                    <input value={contrasena} onChange={(e) => setContrasena(e.target.value)} type="password" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div></div>
                    )}

                    <div>
                        <button onClick={iniciarSesion} class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Iniciar sesion</button>
                    </div>
                </div>
            </div>
            <dialog id="vacio" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-500">Error</h3>
                    <p className="py-4">Completa todos los campos.</p>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
            <dialog id="errorDatos" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-500">Error</h3>
                    <p className="py-4">Usuario o contraseña incorrectos.</p>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}