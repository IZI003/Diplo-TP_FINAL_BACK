import Carton from '../models/Carton.mjs';
import { generarCartones, renderCardHTML } from '../services/bingoService.js';
import { renderizarCarton } from '../views/responseView.mjs';
import {
    renderizarListaCartones,
} from '../views/responseView.mjs';


export async function generarCartonesController(req, res) {
    try {
        // aceptar cantidad desde: req.params.cant, req.query.cant o req.body.cant (POST)
        const cantParam = req.params.cant || req.query.cant || (req.body && req.body.cant);
        const cant = Number(cantParam) || 200;
        // Soporta paginación si no se pasa 'cant' y se pide listado: GET /bingo/generar?page=1&limit=20
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        // Si no se recibió 'cant' en params/body y se usan page/limit, devolvemos listado paginado
        if (!req.params.cant && !req.body?.cant && (req.query.page || req.query.limit)) {
            // delegado a listarCartones (implementado abajo)
            return await listarCartonesController(req, res);
        }

        const inserted = await generarCartones(cant);
        if (!inserted || inserted.error) {
            return res.status(500).json({ mensaje: 'Error generando cartones', detail: inserted });
        }

        const cartonesFormateados = renderizarListaCartones(inserted);
        res.status(200).json({ inserted: inserted.length, cartones: cartonesFormateados });
    } catch (error) {
        res.status(500).send({
            mensaje: 'Error al obtener el Pais',
            error: error.message
        });
    }
}

export async function getCartonHTMLController(req, res) {
    try {
        const { id } = req.params;
        let carton = null;
        // intentar por ObjectId primero si tiene formato 24 hex
        const isHex24 = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        if (isHex24) {
            carton = await Carton.findById(id).lean();
        }
        // si no encontrado por _id, buscar por código (ej: CARTON-001)
        if (!carton) {
            carton = await Carton.findOne({ codigo: id }).lean();
        }
        if (!carton) return res.status(404).send('Cartón no encontrado');
        const html = await renderCardHTML(carton);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (err) {
        console.error('Error getCartonHTMLController:', err);
        return res.status(500).send('Error generando HTML del cartón');
    }
}

export async function generarCartonesHTMLController(req, res) {
    try {
        const cantParam = req.params.cant || req.query.cant;
        const cant = Number(cantParam) || 10;
        const inserted = await generarCartones(cant);
        if (!inserted || inserted.error) return res.status(500).send('Error generando cartones');
        // inserted es array de documentos
        const htmlParts = [];
        for (const doc of inserted) {
            const part = await renderCardHTML(doc);
            htmlParts.push(part);
        }
        // Concatenar todos los bodies (las funciones ya devuelven HTML completo);
        // para simplicidad, devolver un HTML que contiene iframes con cada cartón
        let container = '<!doctype html><html><head><meta charset="utf-8"><title>Cartones</title></head><body>';
        for (let i = 0; i < htmlParts.length; i++) {
            container += `<div style="page-break-after:always;margin-bottom:18px;">${htmlParts[i]}</div>`;
        }
        container += '</body></html>';
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(container);
    } catch (err) {
        console.error('Error generarCartonesHTMLController:', err);
        return res.status(500).send('Error generando HTML de cartones');
    }
}

export async function getCartonJSONController(req, res) {
    try {
        const { id } = req.params;
        let carton = null;
        const isHex24 = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        if (isHex24) carton = await Carton.findById(id).lean();
        if (!carton) carton = await Carton.findOne({ codigo: id }).lean();
        if (!carton) return res.status(404).json({ error: 'Cartón no encontrado' });
        // Usar renderizador para estructurar y ya excluye comprado/jugador_id
        const data = renderizarCarton(carton);
        return res.json(data);
    } catch (err) {
        console.error('Error getCartonJSONController:', err);
        return res.status(500).json({ error: 'Error interno' });
    }
}

export async function generarCartonesJSONController(req, res) {
    try {
        const cantParam = req.params.cant || req.query.cant;
        const cant = Number(cantParam) || 10;
        const inserted = await generarCartones(cant);
        if (!inserted || inserted.error) return res.status(500).json({ error: 'Error generando cartones' });
        const formatted = inserted.map(renderizarCarton);
        return res.json({ inserted: inserted.length, cartones: formatted });
    } catch (err) {
        console.error('Error generarCartonesJSONController:', err);
        return res.status(500).json({ error: 'Error interno' });
    }
}

// Listado paginado de cartones
export async function listarCartonesController(req, res) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const [total, items] = await Promise.all([
            Carton.countDocuments({}),
            Carton.find({}).sort({ fecha_creacion: -1 }).skip(skip).limit(limit).lean()
        ]);
        const totalPages = Math.ceil(total / limit);
        const formatted = items.map(renderizarCarton);
        return res.json({ page, limit, total, totalPages, items: formatted });
    } catch (err) {
        console.error('Error listarCartonesController:', err);
        return res.status(500).json({ error: 'Error interno' });
    }
}

// Actualizar un cartón (PUT /bingo/carton/:id) — permite actualizar campos como 'comprado' o 'jugador_id' (pero no signature/codigo por seguridad)
export async function actualizarCartonController(req, res) {
    try {
        const { id } = req.params;
        const payload = { ...req.body };
        // No permitir cambiar signature ni codigo
        delete payload.signature;
        delete payload.codigo;
        // Actualizar
        const isHex24 = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        const filter = isHex24 ? { _id: id } : { codigo: id };
        const updated = await Carton.findOneAndUpdate(filter, payload, { new: true }).lean();
        if (!updated) return res.status(404).json({ error: 'Cartón no encontrado' });
        return res.json({ mensaje: 'Cartón actualizado', carton: renderizarCarton(updated) });
    } catch (err) {
        console.error('Error actualizarCartonController:', err);
        return res.status(500).json({ error: 'Error interno' });
    }
}

// Eliminar un cartón (DELETE /bingo/carton/:id)
export async function eliminarCartonController(req, res) {
    try {
        const { id } = req.params;
        const isHex24 = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        const filter = isHex24 ? { _id: id } : { codigo: id };
        const deleted = await Carton.findOneAndDelete(filter).lean();
        if (!deleted) return res.status(404).json({ error: 'Cartón no encontrado' });
        return res.json({ mensaje: 'Cartón eliminado', carton: renderizarCarton(deleted) });
    } catch (err) {
        console.error('Error eliminarCartonController:', err);
        return res.status(500).json({ error: 'Error interno' });
    }
}