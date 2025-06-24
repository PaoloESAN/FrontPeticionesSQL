import React, { useState, useEffect } from 'react';

export default function ProcedureSelector({
    baseDatos,
    onProcedureChange,
    value,
    placeholder = "Selecciona procedure",
    className = "select select-bordered"
}) {
    const [procedures, setProcedures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const obtenerProcedures = async (nombreBase) => {
        if (!nombreBase) {
            setProcedures([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`http://localhost:8080/api/procedures?bd=${nombreBase}`);
            if (response.ok) {
                const data = await response.json();
                setProcedures(Array.isArray(data) ? data : []);
            } else {
                console.error('Error al obtener procedures:', response.status);
                setProcedures([]);
            }
        } catch (error) {
            console.error('Error al obtener procedures:', error);
            setProcedures([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        obtenerProcedures(baseDatos);
    }, [baseDatos]);

    // Escuchar evento personalizado para actualizar procedures
    useEffect(() => {
        const handleProceduresActualizados = (event) => {
            if (event.detail?.baseDatos === baseDatos) {
                obtenerProcedures(baseDatos);
            }
        };

        window.addEventListener('proceduresActualizados', handleProceduresActualizados);
        return () => {
            window.removeEventListener('proceduresActualizados', handleProceduresActualizados);
        };
    }, [baseDatos]);

    const handleChange = (e) => {
        const selectedProcedure = e.target.value;
        if (onProcedureChange) {
            onProcedureChange(selectedProcedure);
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
                {isLoading ? 'Cargando procedures...' : placeholder}
            </option>
            {!isLoading && procedures.length > 0 ? (
                procedures.map((procedure, index) => (
                    <option key={index} value={procedure}>
                        {procedure}
                    </option>
                ))
            ) : !isLoading ? (
                <option disabled>
                    {baseDatos ? 'No hay procedures' : 'Selecciona una base de datos'}
                </option>
            ) : null}
        </select>
    );
}
