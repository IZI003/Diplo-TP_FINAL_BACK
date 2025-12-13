import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
export function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "No autorizado" });

    const parts = auth.split(" ");
    if (parts.length !== 2)
        return res.status(401).json({ message: "Token mal formado" });

    const token = parts[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        // ✔ CORREGIDO
        req.userId = payload.id;
        req.userEmail = payload.email;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
}