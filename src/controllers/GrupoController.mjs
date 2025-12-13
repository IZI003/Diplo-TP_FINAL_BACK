import { cambiarGrupoActivoService, crearGrupoService, eliminarUsuarioDelGrupoService, generarInvitacionService, listarUsuariosGrupoService, obtenerGruposDeUsuarioService, previewGrupoService, unirseAGrupoService, unirseGrupoService } from "../services/GrupoService.mjs";

export async function crearGrupoController(req, res) {
    try {
        const { nombreGrupo, adminEmail } = req.body;
        const data = await crearGrupoService(nombreGrupo, adminEmail);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function cambiarGrupoActivoController(req, res) {
    try {
        const { userId, groupId } = req.params;
        const data = await cambiarGrupoActivoService(userId, groupId);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

export async function obtenerGruposDeUsuarioController(req, res) {
    try {
        const { userId } = req.params;
        const data = await obtenerGruposDeUsuarioService(userId);
        res.json(data);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}



export async function listarUsuariosGrupoController(req, res) {
    try {
        // const adminId = req.user.id;        // viene del token / verifyToken
        const { groupId } = req.params;

        const usuarios = await listarUsuariosGrupoService(groupId);
        res.json(usuarios);
    } catch (err) {
        const status = err.status || 400;
        res.status(status).json({ error: err.message });
    }
}

export async function eliminarUsuarioDelGrupoController(req, res) {
    try {
        const adminId = req.user.id;
        const { groupId, userId } = req.params;

        const data = await eliminarUsuarioDelGrupoService(adminId, userId, groupId);
        res.json(data);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function generarInvitacionController(req, res) {
    try {
        // res.status(400).json({ error: req.params });
        const { groupId } = req.params;

        const data = await generarInvitacionService(groupId);
        res.json(data);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function previewGrupoController(req, res) {
    try {
        const { token } = req.params;

        const data = await previewGrupoService(token);
        res.json(data);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
export async function unirseGrupoController(req, res) {
    try {
        const { token } = req.params;
        const data = await unirseGrupoService(token, req.headers.authorization);
        res.json(data);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

