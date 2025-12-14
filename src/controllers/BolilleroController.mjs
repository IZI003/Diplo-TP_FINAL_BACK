import { bolilleroService, sacarBolillaService } from "../services/BolilleroService.js";

export async function sacarBolillaController(req, res) {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            return res.status(400).json({ msg: "Falta grupoId" });
        }

        const resultado = await sacarBolillaService(groupId);

        return res.status(200).json(resultado);

    } catch (err) {
        return res.status(500).json({
            msg: "Error interno",
            error: err.message
        });
    }
}

export async function bolilleroController(req, res) {
    try {
        const { grupoId } = req.params;

        if (!grupoId) {
            return res.status(400).json({ msg: "Falta grupoId" });
        }

        const resultado = await bolilleroService(grupoId);

        return res.status(200).json(resultado);

    } catch (err) {
        return res.status(500).json({
            msg: "Error interno",
            error: err.message
        });
    }
}

