import pais from '../models/Pais.mjs';
import IRepository from './IRepository.mjs';

class PaisRepository extends IRepository {
    async obtenerPorId(id) {
        return await pais.findById(id);
    }

    async obtenerTodos() {
        return await pais.find({});
    }

    async buscarPorAtributo(atributo, valor) {
        return await pais.find({ [atributo]: valor });
    }

    async buscarPornombre(valor) {
        return await pais.findOne({ "nombre": valor });
    }

    async crearPais(body) {
        return await pais.create(body);
    }

    async actualizar(id, body) {
        return await pais.findByIdAndUpdate(id, body, { new: true });
    }

    async eliminarPorId(id) {
        return await pais.findByIdAndDelete(id);
    }

    async eliminarPorNombre(nombre) {
        return await pais.findOneAndDelete({ nombrePais: nombre });
    }

    async eliminarTodosMisPaises() {
        return await pais.deleteMany({ tipoObjeto: 'pais', creador: 'Ezequiel Miranda' });
    }

    async insertarMuchos(paises) {
        return await pais.insertMany(paises);
    }
}

export default new PaisRepository();