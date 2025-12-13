export function renderizarPais(pais) {
    if (!pais) return null;
    return {
        id: pais._id,
        nombre: pais.nombre,
        codigo: pais.codigo,
        region: pais.region,
    };
}

export function renderizarListaPaises(paises = []) {
    return paises.map(renderizarPais);
}
export function renderizarListaCartones(cartones = []) {
    return cartones.map(renderizarCarton);
}

export function renderizarCarton(carton) {
    if (!carton) return null;
    return {
        _id: carton._id,
        matrix: carton.matrix,
        codigo: carton.codigo,
        numeros: carton.numeros,
        numeros_flat: carton.numeros_flat,
        signature: carton.signature,
        fecha_creacion: carton.createdAt || carton.fecha_creacion || null,
    };
}