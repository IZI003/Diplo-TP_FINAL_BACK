## Bingo (Servidor Node.js)

Servidor básico en Node.js usando Express y Mongoose.

Requisitos:
- Node.js >= 18
- MongoDB (local o remoto)

Instalación y uso (PowerShell en Windows):

1. Instalar dependencias

   npm install

2. (Opcional) Configurar la variable de entorno `MONGO_URI` para conectar a MongoDB remoto.

   Recomendado: usar variables separadas para usuario/contraseña si la contraseña tiene caracteres especiales.

   Opción A — pasar usuario/contraseña por separado (recomendado):

   # PowerShell (sesión actual)
   $env:MONGO_URI = 'mongodb://190.228.131.42:27017/bingo'
   $env:MONGO_USER = 'bingo_usario'
   $env:MONGO_PASS = 'TU_CONTRASENA_AQUI'
   npm run dev

   Opción B — usar URI completa (codifica caracteres especiales en la contraseña):

   # Si la contraseña contiene '%', '@', '/', etc. debes URL-encodearla. Ej:
   # contraseña literal: %123Bingo2024 -> encoded: %25123Bingo2024
   $env:MONGO_URI = 'mongodb://bingo_usario:%25123Bingo2024@190.228.131.42:27017/bingo?authSource=bingo'; npm run dev

3. Ejecutar en desarrollo (con nodemon):

   npm run dev

4. Ejecutar en producción:

   npm start

Endpoints:
- GET / -> estado del servidor (retorna JSON: { ok: true, message: 'Servidor Bingo funcionando' })

Probar el endpoint raíz (PowerShell):

   Invoke-RestMethod http://localhost:3000/

Notas:
- El archivo principal es `src/server.js`. Si usas MongoDB local, la conexión por defecto es `mongodb://localhost:27017/bingo`.
- Para desarrollo se incluye `nodemon` como dependencia de desarrollo.

Problemas de seguridad detectados por npm:
- Al instalar dependencias puede aparecer `npm audit` con vulnerabilidades; revisa y arregla según las necesidades del proyecto.

Si quieres, puedo añadir rutas de ejemplo y modelos de Mongoose (usuarios, partidas) como siguiente paso.
