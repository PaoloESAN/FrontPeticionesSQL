import React, { createContext, useContext, useState, useEffect } from 'react';

const BaseDatosContext = createContext();

export function BaseDatosProvider({ children }) {
    const [basesDatos, setBasesDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const obtenerBasesDatos = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('http://localhost:8080/api/listarBases');
            if (response.ok) {
                const data = await response.json();
                console.log('Bases de datos obtenidas (contexto):', data);
                setBasesDatos(Array.isArray(data) ? data : []);
            } else {
                console.error('Error en la respuesta:', response.status);
                setError('Error al cargar bases de datos');
            }
        } catch (error) {
            console.error('Error al obtener bases de datos:', error);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    const refrescarBasesDatos = () => {
        obtenerBasesDatos();
    };

    useEffect(() => {
        obtenerBasesDatos();
    }, []);

    const value = {
        basesDatos,
        isLoading,
        error,
        refrescarBasesDatos
    };

    return (
        <BaseDatosContext.Provider value={value}>
            {children}
        </BaseDatosContext.Provider>
    );
}

export function useBasesDatos() {
    const context = useContext(BaseDatosContext);
    if (!context) {
        throw new Error('useBasesDatos debe usarse dentro de BaseDatosProvider');
    }
    return context;
}
