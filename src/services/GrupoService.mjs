import Group from "../models/Group.mjs";
import User from "../models/User.mjs";
import jwt from "jsonwebtoken";

export async function crearGrupoService(nombreGrupo, emailAdmin) {

    // buscar admin por email
    const admin = await User.findOne({ email: emailAdmin });
    if (!admin) throw new Error("El administrador no existe");

    // ¿Ya existe un grupo con ese nombre?
    const existing = await Group.findOne({ nombre: nombreGrupo });
    if (existing) throw new Error("El grupo ya existe");

    // crear grupo
    const grupo = await Group.create({
        nombre: nombreGrupo,
        admin: admin,
        usuarios: [admin._id]
    });
    if (!admin.grupos) admin.grupos = [];
    if (!admin.grupoActivo) admin.grupoActivo = null;
    // agregar grupo al listado de grupos del usuario
    admin.grupos.push(grupo._id);

    // definir como grupo activo
    admin.grupoActivo = grupo;

    await admin.save();

    return { ok: true, grupoId: grupo._id };
}

export async function cambiarGrupoActivoService(userId, groupId) {
    const user = await User.findById(userId);

    if (!user) throw new Error("Usuario no encontrado");

    // validar pertenencia
    if (!user.grupos.includes(groupId)) {
        throw new Error("El usuario no pertenece a este grupo");
    }

    user.grupoActivo = groupId;
    await user.save();

    return { ok: true, grupoActivo: user.grupoActivo };
}

export async function obtenerGruposDeUsuarioService(userId) {
    // 1. Buscar usuario con populate de GRUPOS + ADMIN
    let user = await User.findById(userId)
        .populate({
            path: "grupos",
            populate: { path: "admin", select: "nombre email" },
            strictPopulate: false
        })
        .populate({
            path: "grupoActivo",
            populate: { path: "admin", select: "nombre email" },
            strictPopulate: false
        });

    if (!user) throw new Error("Usuario no encontrado");

    // 2. Reconstruir grupos si no existen
    if (!Array.isArray(user.grupos) || user.grupos.length === 0) {
        const gruposEncontrados = await Group.find({ usuarios: user._id });

        user.grupos = gruposEncontrados.map(g => g._id);
        await user.save();

        // Volver a poblar incluyendo ADMIN
        user = await User.findById(userId)
            .populate({
                path: "grupos",
                populate: { path: "admin", select: "nombre email" },
                strictPopulate: false
            })
            .populate({
                path: "grupoActivo",
                populate: { path: "admin", select: "nombre email" },
                strictPopulate: false
            });
    }

    // 3. Limpiar respuesta
    const grupos = user.grupos.map(g => ({
        _id: g._id,
        nombre: g.nombre,
        admin: {
            _id: g.admin?._id,
            nombre: g.admin?.nombre || "—",
            email: g.admin?.email || ""
        }
    }));

    return {
        grupos,
        grupoActivo: user.grupoActivo?._id || null
    };
}

export async function generarInvitacionService(groupId) {
    const grupo = await Group.findById(groupId);
    if (!grupo) throw new Error("Grupo no encontrado " + groupId);

    const token = jwt.sign(
        {
            groupId: grupo._id,
            type: "invitation"
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return { token };
}

export async function unirseAGrupoService(userId, token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "invitation") {
        throw new Error("Token inválido");
    }

    const groupId = decoded.groupId;

    const grupo = await Group.findById(groupId);
    if (!grupo) throw new Error("Grupo no encontrado");

    const user = await User.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // evitar duplicados
    if (!grupo.usuarios.includes(user._id)) {
        grupo.usuarios.push(user._id);
        await grupo.save();
    }

    if (!user.grupos.includes(groupId)) {
        user.grupos.push(groupId);
    }

    // si no tiene grupo activo → asignarlo
    if (!user.grupoActivo) user.grupoActivo = groupId;

    await user.save();

    return { ok: true, groupId };
}

export async function eliminarUsuarioDelGrupoService(userIdTarget, groupId) {
    const grupo = await Group.findById(groupId);
    if (!grupo) throw new Error("Grupo no encontrado");

    // borrar del grupo
    grupo.usuarios = grupo.usuarios.filter(u => String(u) !== String(userIdTarget));
    await grupo.save();

    // borrar del usuario
    const user = await User.findById(userIdTarget);
    if (user) {
        user.grupos = user.grupos.filter(g => String(g) !== String(groupId));
        if (String(user.grupoActivo) === String(groupId)) {
            user.grupoActivo = null;
        }
        await user.save();
    }

    return { ok: true };
}
export async function listarUsuariosGrupoService(groupId) {
    const grupo = await Group.findById(groupId);
    if (!grupo) throw new Error("Grupo no encontrado");
    // traer usuarios con campos útiles
    const usuarios = await User.find({ _id: { $in: grupo.usuarios } })
        .select("_id nombre email")
        .lean();

    return usuarios;
}


export async function previewGrupoService(token) {

    const data = jwt.verify(token, process.env.JWT_SECRET);

    const grupo = await Group.findById(data.groupId)
        .populate("admin", "nombre email");

    return {
        nombreGrupo: grupo.nombre,
        admin: grupo.admin
    };
}

export async function unirseGrupoService(token, authorization) {

    const userId = await usuario_logueado(authorization);
    if (!userId) throw new Error("Usuario no autentizado");

    const data = jwt.verify(token, process.env.JWT_SECRET);

    const grupo = await Group.findById(data.groupId);
    if (!grupo) throw new Error("Grupo no encontrado");

    if (!grupo.usuarios.includes(userId)) {
        grupo.usuarios.push(userId);
        await grupo.save();
    }

    // 3) Buscar usuario
    const user = await User.findById(userId);

    // inicializar por si es usuario viejo
    if (!user.grupos) user.grupos = [];
    if (!user.grupoActivo) user.grupoActivo = null;

    // 4) Agregar grupo a la lista de grupos del usuario (si no está)
    if (!user.grupos.map(id => String(id)).includes(String(grupo._id))) {
        user.grupos.push(grupo._id);
    }

    // 5) Hacer que este grupo quede como activo
    user.grupoActivo = grupo._id;

    // 6) Guardar usuario actualizado
    await user.save();

    return { ok: true, groupId: grupo._id };
}

async function usuario_logueado(authorization) {
    const token = authorization.split(" ")[1];
    // const token = parts[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    return payload.id;
}