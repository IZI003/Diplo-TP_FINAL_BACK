class IRepository {
    obtenerPorId(id) {
        throw new Error("Método 'obtenerPorId()' no implementado");
    }

    obtenerTodos() {
        throw new Error("Método 'obtenerTodos()' no implementado");
    }

    buscarPorAtributo(atributo, valor) {
        throw new Error("Método 'buscarPorAtributo()' no implementado");
    }

    crearPais(body) {
        throw new Error('Metodo crearPais() no implementado');
    }

    actualizar(id, body) {
        throw new Error('Metodo actualizar() no implementado');
    }

    eliminarPorId(id) {
        throw new Error('Metodod eliminarPorId() no implementado');
    }

    eliminarPorNombre(nombre) {
        throw new Error('Metodo elimiarPorNombre() no implementado');
    }
}

export default IRepository;