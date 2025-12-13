import Seleccion from "../models/Seleccion.mjs";

export async function guardarSeleccionService({ userId, cartones }) {
    if (!userId) return { error: true, msg: "userId requerido" };
    if (!Array.isArray(cartones)) return { error: true, msg: "cartones debe ser array" };

    // ✔ Upsert (crea si no existe / actualiza si existe)
    const updated = await Seleccion.findOneAndUpdate(
        { userId },
        { cartones },
        { new: true, upsert: true }
    ).lean();

    return { ok: true, seleccion: updated };
}

export async function obtenerSeleccionPorUsuarioService(userId) {
    const seleccion = await Seleccion.findOne({ userId })
        .populate("cartones")
        .lean();

    return seleccion;
}

export async function eliminarSeleccionService(userId) {
    return await Seleccion.findOneAndDelete({ userId }).lean();
}
