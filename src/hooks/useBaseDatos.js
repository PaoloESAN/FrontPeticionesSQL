import { useState, useCallback } from 'react';

export const useBaseDatos = () => {
    const [isLoading, setIsLoading] = useState(false);

    const crearBase = useCallback(async (nombre) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/crearBase?nombre=${nombre}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalCrearOk')?.showModal();
            } else {
                document.getElementById('modalCrearErrorBase')?.showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalCrearError')?.showModal();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const eliminarBase = useCallback(async (nombre) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/eliminarBase?nombre=${nombre}`, {
                method: 'POST',
            });

            if (response.ok) {
                document.getElementById('modalEliminarOk')?.showModal();
            } else {
                document.getElementById('modalEliminarErrorBase')?.showModal();
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalEliminarError')?.showModal();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const ejecutarConsulta = useCallback(async (consultaSQL, baseDatosSeleccionada) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/consultaBase?nombre=${baseDatosSeleccionada}&sql=${consultaSQL}`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                const resultado = document.getElementById('resultadoConsulta');
                if (resultado) {
                    resultado.value = data.respuesta;
                }
                console.log('Consulta ejecutada:', data);
                document.getElementById('modalConsultaOk')?.showModal();
            } else {
                document.getElementById('modalConsultaErrorBase')?.showModal();
                const errorData = await response.json();
                console.error('Error en la consulta:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('modalConsultaError')?.showModal();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        crearBase,
        eliminarBase,
        ejecutarConsulta,
        isLoading
    };
};
