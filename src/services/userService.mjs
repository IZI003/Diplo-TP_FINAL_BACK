import User from "../models/User.mjs";
import bcrypt from "bcryptjs";

export async function createUser({ nombre, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
        const e = new Error("Email del usuario ya existe");
        e.status = 409;
        throw e;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ nombre, email, passwordHash });
    await user.save();

    if (!user.grupos) user.grupos = [];
    if (!user.grupoActivo) user.grupoActivo = null;
    // 8️⃣ agregar grupo a la lista de grupos del usuario
    user.grupos.push(grupo._id);

    // asignarlo como grupo ACTIVO
    user.grupoActivo = grupo;

    await user.save();

    // no devolver passwordHash al front
    const { passwordHash: _, ...rest } = user.toObject();
    return rest;
}

export async function getUsers({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
        User.countDocuments({}),
        User.find({}).skip(skip).limit(limit).select("-passwordHash").lean()
    ]);
    const totalPages = Math.ceil(total / limit);
    return { page, limit, total, totalPages, items: users };
}

export async function getUserById(id) {
    return await User.findById(id).select("-passwordHash").lean();
}

export async function updateUser(id, payload) {
    // Si vienen password, lo hasheamos
    const update = { ...payload };
    if (update.password) {
        const salt = await bcrypt.genSalt(10);
        update.passwordHash = await bcrypt.hash(update.password, salt);
        delete update.password;
    }
    // No permitimos cambiar email uniqueness handling here is DB-level
    const updated = await User.findByIdAndUpdate(id, update, { new: true }).select("-passwordHash").lean();
    return updated;
}

export async function deleteUser(id) {
    return await User.findByIdAndDelete(id).lean();
}
import jwt from "jsonwebtoken";
import Group from "../models/Group.mjs";

export async function loginUserService(email, password) {
    const user = await User.findOne({ email })
        .populate({
            path: "grupoActivo",
            populate: [
                { path: "admin", select: "nombre email" },
                { path: "usuarios", select: "nombre email" }
            ],
            strictPopulate: false
        });

    if (!user) throw new Error("Usuario no encontrado");

    if (!user.passwordHash) throw new Error("Usuario sin password");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Contraseña incorrecta");

    // Crear token
    if (!user.grupos) user.grupos = [];
    if (!user.grupoActivo) user.grupoActivo = null;
    const token = jwt.sign(
        { id: user._id, email: user.email, grupoActivo: user.grupoActivo ?? [] },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { token, user };
}

export async function registerUserService({ nombre, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) throw { status: 400, message: "Email ya registrado" };

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await User.create({ nombre, email, passwordHash: hash });
    return await loginUserService(email, password);
}

export async function getUserByIdService(id) {
    const user = await User.findById(id).select("-password").lean();
    return user;
}

export async function updateUserService(id, payload) {
    if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
    }
    const updated = await User.findByIdAndUpdate(id, payload, { new: true }).select("-password").lean();
    return updated;
}
