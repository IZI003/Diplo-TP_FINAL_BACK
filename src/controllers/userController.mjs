import * as userService from "../services/userService.mjs";

export async function createUserController(req, res) {
    try {
        const { nombre, email, password, grupoId, adminMail } = req.body;
        if (!nombre || !email || !password || !adminMail) {
            return res.status(400).json({ error: "name, email, usuarioId and password required" });
        }
        const user = await userService.createUser({ nombre, email, password, grupoId, adminMail });
        return res.status(201).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(err.status || 500).json({ error: err.message });
    }
}

export async function listUsersController(req, res) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    try {
        const data = await userService.getUsers({ page, limit });
        return res.json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
}

export async function getUserController(req, res) {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
}

export async function updateUserController(req, res) {
    try {
        const updated = await userService.updateUser(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: "User not found" });
        return res.json({ user: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

export async function deleteUserController(req, res) {
    try {
        const deleted = await userService.deleteUser(req.params.id);
        if (!deleted) return res.status(404).json({ error: "User not found" });
        return res.json({ message: "User deleted", user: deleted });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal error" });
    }
}
