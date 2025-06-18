import React from 'react';
import { useBasesDatos } from '../../context/BaseDatosContext';

export default function BaseDatosSelector({
    onBaseDatosChange,
    value,
    placeholder = "Selecciona base de datos",
    className = "select select-accent"
}) {
    const { basesDatos, isLoading } = useBasesDatos();

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
