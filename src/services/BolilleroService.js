import { getIO } from "./socketService.mjs";
import Bolillero from "../models/bolillero.mjs";

export async function sacarBolillaService(grupoId) {
    const io = getIO();

    let bolillero = await buscar(grupoId);

    if (bolillero.numerosRestantes.length === 0) {
        bolillero.activo = false;
        await bolillero.save();

        io.to(grupoId).emit("bolillaGenerada", {
            numero: bolillero.ultimoNumero,
            numerosSalidos: bolillero.numerosSalidos
        });
        io.to(grupoId).emit("estadoBolillero", {
            terminado: true,
            numerosSalidos: bolillero.numerosSalidos
        });

        return { terminado: true };
    }

    const randomIndex = Math.floor(Math.random() * bolillero.numerosRestantes.length);
    const numero = bolillero.numerosRestantes[randomIndex];

    bolillero.numerosRestantes.splice(randomIndex, 1);
    bolillero.numerosSalidos.push(numero);
    bolillero.ultimoNumero = numero;
    await bolillero.save();

    // 🔥 Emitir actualización a TODOS en el grupo
    io.to(grupoId).emit("bolillaGenerada", {
        numero: bolillero.ultimoNumero,
        numerosSalidos: bolillero.numerosSalidos
    });
    io.to(grupoId).emit("estadoBolillero", {
        ultima: bolillero.ultimoNumero,
        numerosSalidos: bolillero.numerosSalidos
    });

    return {
        numero: bolillero.ultimoNumero,
        numerosSalidos: bolillero.numerosSalidos,
        restantes: bolillero.numerosRestantes.length
    };
}

async function buscar(grupoId) {

    let bolillero = await Bolillero.findOne({ grupoId: grupoId });

    if (!bolillero) {
        bolillero = new Bolillero({
            grupoId: grupoId,
            activo: true,
            numerosRestantes: Array.from({ length: 89 }, (_, i) => i + 1),
            numerosSalidos: []
        });
        await bolillero.save();
    }

    return bolillero;
}

export async function bolilleroService(grupoId) {
    const gid = String(grupoId).replace("groupId=", "").trim();
    let bolillero = await Bolillero.findOne({ grupoId: gid });

    if (!bolillero) return null;

    return {
        numero: bolillero.ultimoNumero,
        numerosSalidos: bolillero.numerosSalidos,
        restantes: bolillero.numerosRestantes.length
    };
}