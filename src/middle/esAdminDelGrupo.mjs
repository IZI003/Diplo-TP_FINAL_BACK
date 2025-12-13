/*import Group from "../models/Group.mjs";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function esAdminDelGrupo(req, res, next) {
    try {
        const { groupId } = req.params;
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ message: "No autorizado" });
        const parts = auth.split(" ");
        if (parts.length !== 2) return res.status(401).json({ message: "Token mal formado" });

        const token = parts[1];

        const grupo = await Group.findById(groupId);
        if (!grupo) return res.status(404).json({ error: "Grupo no encontrado" });

        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;

        if (String(grupo.admin) !== String(req.userId)) {
            return res.status(403).json({ error: "No autorizado admin " + String(grupo.admin) + " payload " + JSON.stringify(payload, null, 2) + " userId " + String(req.userId) });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}*/

import jwt from "jsonwebtoken";
import Group from "../models/Group.mjs";

export async function esAdminDelGrupo(req, res, next) {
    try {
        const { groupId } = req.params;

        // 1) Validar header
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ message: "No autorizado" });

        const parts = auth.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ message: "Token mal formado" });
        }

        const token = parts[1];

        // 2) Buscar grupo
        const grupo = await Group.findById(groupId);
        if (!grupo) return res.status(404).json({ error: "Grupo no encontrado" });

        // 3) Verificar token con la CLAVE CORRECTA
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // DEBUG opcional
       // console.log("PAYLOAD:", payload);

        if (!payload || !payload.id) {
            return res.status(400).json({ error: "Token inválido (no contiene ID)", payload });
        }

        req.userId = payload.id;

        // 4) Comparar admin vs token.id
        if (String(grupo.admin) !== String(req.userId)) {
            return res.status(403).json({
                error: "No autorizado (no es admin del grupo)",
                admin: String(grupo.admin),
                tokenId: String(req.userId),
                payload
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido", detail: err.message });
    }
}
