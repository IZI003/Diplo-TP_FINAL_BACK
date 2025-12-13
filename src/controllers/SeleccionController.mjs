import {
    guardarSeleccionService,
    obtenerSeleccionPorUsuarioService,
    eliminarSeleccionService
} from "../services/seleccionService.js";

export async function guardarSeleccionController(req, res) {
    try {
        const { userId, cartones } = req.body;

        const result = await guardarSeleccionService({ userId, cartones });

        if (result.error) {
            return res.status(400).json(result);
        }

        return res.status(200).json({
            msg: "Selección guardada",
            data: result.seleccion
        });

    } catch (err) {
        console.error("Error guardando selección:", err);
        return res.status(500).json({
            msg: "Error interno",
            error: err.message
        });
    }
}

export async function obtenerSeleccionController(req, res) {
    try {
        const { userId } = req.params;

        const seleccion = await obtenerSeleccionPorUsuarioService(userId);

        if (!seleccion) {
            return res.status(404).json({ msg: "No hay selección guardada" });
        }

        return res.status(200).json(seleccion);

    } catch (err) {
        return res.status(500).json({ msg: "Error interno", error: err.message });
    }
}

export async function eliminarSeleccionController(req, res) {
    try {
        const { userId } = req.params;

        const deleted = await eliminarSeleccionService(userId);

        if (!deleted)
            return res.status(404).json({ msg: "No había selección para eliminar" });

        return res.status(200).json({ msg: "Selección eliminada", deleted });

    } catch (err) {
        return res.status(500).json({ msg: "Error interno", error: err.message });
    }
}
