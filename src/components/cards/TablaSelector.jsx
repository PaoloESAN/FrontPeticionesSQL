import React, { useState, useEffect } from 'react';

export default function TablaSelector({
    baseDatos,
    onTablaChange,
    value,
    placeholder = "Selecciona tabla",
    className = "select select-accent"
}) {
    const [tablas, setTablas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const obtenerTablas = async (nombreBase) => {
        if (!nombreBase) {
            setTablas([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/tablas?nombre=${nombreBase}`);
            if (response.ok) {
                const data = await response.json();
                setTablas(Array.isArray(data) ? data : []);
            } else {
                console.error('Error al obtener tablas:', response.status);
                setTablas([]);
            }
        } catch (error) {
            console.error('Error al obtener tablas:', error);
            setTablas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        obtenerTablas(baseDatos);
    }, [baseDatos]);

    const handleChange = (e) => {
        const selectedTable = e.target.value;
        if (onTablaChange) {
            onTablaChange(selectedTable);
        }
    };

    return (
        <select
            className={className}
            value={value}
            onChange={handleChange}
            disabled={!baseDatos}
        >
            <option value="" disabled>
                {isLoading ? 'Cargando tablas...' : placeholder}
            </option>
            {!isLoading && tablas.length > 0 ? (
                tablas.map((tabla, index) => (
                    <option key={index} value={tabla}>
                        {tabla}
                    </option>
                ))
            ) : !isLoading ? (
                <option disabled>
                    {baseDatos ? 'No hay tablas' : 'Selecciona una base de datos'}
                </option>
            ) : null}
        </select>
    );
}
