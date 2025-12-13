🎯 Bingo Backend API

Backend del proyecto Bingo, desarrollado con Node.js, Express y MongoDB, que provee una API REST junto con comunicación en tiempo real mediante Socket.IO.

Este servidor se encarga de la autenticación de usuarios, la gestión de datos del sistema y la comunicación en tiempo real entre clientes.

🚀 Tecnologías utilizadas
🧠 Lenguaje & Runtime

Node.js (>= 18)

JavaScript (ES Modules)

🌐 Servidor & API

Express 5

Express Validator (validaciones)

CORS

Method Override

🗄️ Base de datos

MongoDB

Mongoose (ODM)

🔐 Seguridad & Autenticación

JWT (jsonwebtoken) – autenticación basada en tokens

bcryptjs – hash de contraseñas

🔌 Tiempo real

Socket.IO – comunicación bidireccional en tiempo real

⚙️ Configuración & Entorno

dotenv – variables de entorno

PM2 – gestión de procesos en producción

🛠️ Desarrollo

Nodemon – recarga automática en desarrollo

📁 Estructura general del proyecto

bingoBackend/
├── src/
│   ├── config/        # Configuración (DB, entorno)
│   ├── controllers/  # Controladores
│   ├── routes/       # Rutas de la API
│   ├── models/       # Modelos Mongoose
│   ├── middlewares/  # Middlewares
│   └── server.js     # Punto de entrada del servidor
├── .env              # Variables de entorno
├── package.json
└── ecosystem.config.cjs

🔐 Variables de entorno

Ejemplo de archivo .env:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/bingo
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=4h
NODE_ENV=production

▶️ Scripts disponibles
Desarrollo
npm run dev

Producción
npm start


Con PM2:

pm2 start ecosystem.config.cjs

🔌 Socket.IO

El servidor expone Socket.IO para eventos en tiempo real, permitiendo:

Conexión y desconexión de clientes

Comunicación bidireccional

Integración directa con el frontend en React

🧩 Integración con el Frontend

El backend está preparado para ser consumido por un frontend desarrollado con:

React + Vite

Socket.IO Client

Axios

Y se encuentra optimizado para funcionar detrás de Nginx como reverse proxy.

📌 Estado del proyecto

🚧 En desarrollo activo
📦 Arquitectura modular y escalable
⚡ Preparado para producción
