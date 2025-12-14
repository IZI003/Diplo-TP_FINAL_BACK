import express from "express";
import cors from "cors";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/database.mjs";
import routes from "./routes/routes.mjs";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { setIO } from "./services/socketService.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.resolve(__dirname, "..", "public")));

const PORT = process.env.PORT || 4000;

// DB
try {
    await connectDB();
} catch (err) {
    console.error('Error conectando a Mongo:', err.message);
    process.exit(1);
}

// Rutas
app.use("", routes);

// 404
app.use((req, res) => {
    res.status(404).send({ mensaje: "Ruta no encontrada" });
});

/* --------------------------------------
   🔥 SOCKET.IO CONFIG
-------------------------------------- */

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"]
    }
});
setIO(io);

io.on("connection", (socket) => {
    // Unirse a un grupo
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
    });
    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
    });
    socket.on("disconnect", () => {
    });
});

/* --------------------------------------
   🚀 INICIAR SERVIDOR
---------------------------------------- */

server.listen(PORT, () => {
    console.log(`🔥 Servidor + Socket.io en puerto ${PORT}`);
});
