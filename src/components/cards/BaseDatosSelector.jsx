import React, { useState, useEffect } from 'react';

export default function BaseDatosSelector({
    onBaseDatosChange,
    value,
    placeholder = "Selecciona base de datos",
    className = "select select-accent"
}) {
    const [basesDatos, setBasesDatos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const obtenerBasesDatos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8080/api/listarBases');
            if (response.ok) {
                const data = await response.json();
                setBasesDatos(Array.isArray(data) ? data : []);
            } else {
                console.error('Error en la respuesta:', response.status);
            }
        } catch (error) {
            console.error('Error al obtener bases de datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        obtenerBasesDatos();
    }, []);

    const handleChange = (e) => {
        const selectedBase = e.target.value;
        if (onBaseDatosChange) {
            onBaseDatosChange(selectedBase);
        }
    };

    return (
        <select
            className={className}
            value={value}
            onChange={handleChange}
        >
            <option value="" disabled>
                {isLoading ? 'Cargando...' : placeholder}
            </option>
            {!isLoading && basesDatos.length > 0 ? (
                basesDatos.map((base, index) => (
                    <option key={index} value={base}>
                        {base}
                    </option>
                ))
            ) : !isLoading ? (
                <option disabled>No hay bases de datos</option>
            ) : null}
        </select>
    );
}
