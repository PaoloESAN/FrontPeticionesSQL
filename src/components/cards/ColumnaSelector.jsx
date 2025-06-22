import React, { useState, useEffect } from 'react';

export default function ColumnaSelector({
    baseDatos,
    tabla,
    onColumnaChange,
    value,
    placeholder = "Selecciona columna",
    className = "select select-accent",
    incluirAsterisco = true
}) {
    const [columnas, setColumnas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const obtenerColumnas = async (nombreTabla, nombreBase) => {
        if (!nombreTabla || !nombreBase) {
            setColumnas([]);
            return;
        }

        try {
            setIsLoading(true); const response = await fetch(`http://localhost:8080/api/columnas?tabla=${nombreTabla}&bd=${nombreBase}`);
            if (response.ok) {
                const data = await response.json();
                // Adaptar la nueva estructura de datos
                if (Array.isArray(data) && data.length > 0) {
                    // Si los elementos son objetos con la nueva estructura, extraer solo los nombres
                    const columnasProcessadas = data.map(columna => {
                        if (typeof columna === 'object' && columna.nombre) {
                            return columna.nombre;
                        }
                        return columna; // Por compatibilidad con la estructura anterior
                    });
                    setColumnas(columnasProcessadas);
                } else {
                    setColumnas([]);
                }
            } else {
                console.error('Error al obtener columnas:', response.status);
                setColumnas([]);
            }
        } catch (error) {
            console.error('Error al obtener columnas:', error);
            setColumnas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        obtenerColumnas(tabla, baseDatos);
    }, [tabla, baseDatos]);

    const handleChange = (e) => {
        const selectedColumn = e.target.value;
        if (onColumnaChange) {
            onColumnaChange(selectedColumn);
        }
    };

    return (
        <select
            className={className}
            value={value}
            onChange={handleChange}
            disabled={!tabla || !baseDatos}
        >
            <option value="" disabled>
                {isLoading ? 'Cargando columnas...' : placeholder}
            </option>
            {incluirAsterisco && !isLoading && (
                <option value="*">* (Todas)</option>
            )}
            {!isLoading && columnas.length > 0 ? (
                columnas.map((columna, index) => (
                    <option key={index} value={columna}>
                        {columna}
                    </option>
                ))
            ) : !isLoading ? (
                <option disabled>
                    {tabla ? 'No hay columnas' : 'Selecciona una tabla'}
                </option>
            ) : null}
        </select>
    );
}
