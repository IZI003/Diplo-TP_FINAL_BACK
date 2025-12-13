import { registerUserService, loginUserService, getUserByIdService } from "../services/userService.mjs";

export async function registerController(req, res) {
    try {
        const { nombre, email, password } = req.body;
        const user = await registerUserService({ nombre, email, password });
        return res.status(201).json({ user });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Error interno" });
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email y password requeridos" });

        const { token, user } = await loginUserService(email, password);

        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                email: user.email,
                groupId: user.grupoActivo._id,
                nombre: user.nombre,
            },
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export async function meController(req, res) {
    try {
        const id = req.userId; // set by auth middleware
        const user = await getUserByIdService(id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ message: "Error interno" });
    }
}
