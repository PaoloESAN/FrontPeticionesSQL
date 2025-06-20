import React, { useState, useEffect } from 'react';

export default function VistaSelector({
    baseDatos,
    onVistaChange,
    value,
    placeholder = "Selecciona vista",
    className = "select select-accent"
}) {
    const [vistas, setVistas] = useState([]);
    const [isLoading, setIsLoading] = useState(false); const obtenerVistas = async (nombreBase) => {
        if (!nombreBase) {
            setVistas([]);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Consultando vistas para base de datos:', nombreBase);

            const response = await fetch(`http://localhost:8080/api/vistas?bd=${encodeURIComponent(nombreBase)}`, {
                method: 'GET',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Respuesta de vistas:', data);

                // Asumiendo que la respuesta es un array de nombres de vistas
                const nombresVistas = Array.isArray(data) ? data : [];

                console.log('Vistas encontradas:', nombresVistas);
                setVistas(nombresVistas);
            } else {
                console.error('Error al obtener vistas:', response.status);
                const errorText = await response.text();
                console.error('Detalle del error:', errorText);
                setVistas([]);
            }
        } catch (error) {
            console.error('Error al obtener vistas:', error);
            setVistas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        obtenerVistas(baseDatos);
    }, [baseDatos]);

    // Escuchar eventos de actualización de vistas
    useEffect(() => {
        const handleVistasActualizadas = (event) => {
            if (event.detail.baseDatos === baseDatos) {
                obtenerVistas(baseDatos);
            }
        };

        window.addEventListener('vistasActualizadas', handleVistasActualizadas);

        return () => {
            window.removeEventListener('vistasActualizadas', handleVistasActualizadas);
        };
    }, [baseDatos]);

    const handleChange = (e) => {
        const selectedVista = e.target.value;
        if (onVistaChange) {
            onVistaChange(selectedVista);
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
                {isLoading ? 'Cargando vistas...' : placeholder}
            </option>
            {!isLoading && vistas.length > 0 ? (
                vistas.map((vista, index) => (
                    <option key={index} value={vista}>
                        {vista}
                    </option>
                ))
            ) : !isLoading ? (
                <option disabled>No hay vistas disponibles</option>
            ) : null}
        </select>
    );
}
