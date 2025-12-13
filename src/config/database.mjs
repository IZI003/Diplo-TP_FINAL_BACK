import mongoose from "mongoose";
import 'dotenv/config';

export async function connectDB() {
    const MONGO_URI = process.env.MONGO_URI;
    try {
        mongoose.set('strictQuery', false);
        // Si el usuario y la contraseña están en variables de entorno, pásalas
        // como opciones en lugar de incrustarlas en la URI. Esto evita problemas
        // con caracteres especiales no permitidos por saslprep.
        const opts = { dbName: 'bingo' };
        const user = process.env.MONGO_USER;
        const pass = process.env.MONGO_PASS;
        if (user && pass) {
            opts.user = user;
            opts.pass = pass;
        }
        await mongoose.connect(MONGO_URI, opts);
        console.log('✅ Conectado a MongoDB');
    } catch (err) {
        console.error('❌ Error al conectar a MongoDB:', err);
        // no hacemos process.exit para no forzar cierre durante desarrollo
        throw err;
    }
}
