import express from "express";
import cors from "cors";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/database.mjs";
import routes from "./routes/routes.mjs";
import "dotenv/config";
import http from "http";          // ✅ IMPORTANTE
import { Server } from "socket.io";
import { setIO } from "./services/socketService.mjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Crear servidor HTTP para usar con socket.io
const server = http.createServer(app);   // 👈 ESTE SÍ EXISTE

// Middlewares
app.use(express.json());
app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.resolve(__dirname, "..", "public")));

const PORT = process.env.PORT || 4000;

// Anti-render
app.use((req, res, next) => {
    const originalRender = res.render;
    res.render = function (view, locals = {}) {
        return res.json({ viewAttempted: view, data: locals });
    };
    res.render.__original = originalRender;
    next();
});

// Conexión a MongoDB
try {

    //if (!process.env.DISABLE_MONGO) {
    try {
        await connectDB();
    } catch (err) {
        console.error('Error conectando a Mongo:', err.message);
        process.exit(1);
    }
    // } else {
    //     console.log("⚠️  MODO DESARROLLO: MongoDB deshabilitado");
    // }
} catch (err) {
    console.error("Error conectando a Mongo:", err.message);
    process.exit(1);
}

// Rutas REST normales
app.use("", routes);

// Ruta 404
app.use((req, res) => {
    res.status(404).send({ mensaje: "Ruta no encontrada" });
});

/* ------------------------------------------------
   🔥 SOCKET.IO
--------------------------------------------------*/
let grupos = {}; // { grupoId: { bolillas: [] } }

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
        console.log(`Jugador ${socket.id} se unió a ${groupId}`);

        if (grupos[groupId]) {
            socket.emit("estadoBolillero", grupos[groupId].bolillas);
        }
    });

    socket.on("sacarBolilla", async (groupId) => {
        const data = await sacarBolillaService(groupId);
        // el service ya hace los emit, listo.
    });
    // Admin genera bolilla
    socket.on("nuevaBolilla", ({ groupId, numero }) => {
        if (!grupos[groupId]) grupos[groupId] = { bolillas: [] };

        grupos[groupId].bolillas.push(numero);

        io.to(groupId).emit("bolillaGenerada", numero);
        io.to(groupId).emit("estadoBolillero", grupos[groupId].bolillas);
    });

    // Usuario canta bingo
    socket.on("bingo", ({ groupId, user }) => {
        io.to(groupId).emit("bingoCantado", {
            user,
            timestamp: Date.now()
        });
    });

    socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado:", socket.id);
    });
});

/* -------------------------------------------
   🚀 INICIAR SERVIDOR HTTP + SOCKET
--------------------------------------------*/
server.listen(PORT, () => {
    console.log(`🔥 Servidor + Socket.io en puerto ${PORT}`);
});
