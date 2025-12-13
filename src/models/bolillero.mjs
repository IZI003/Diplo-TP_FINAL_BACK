import { model, Schema } from "mongoose";

const BolilleroSchema = new Schema({
    grupoId: { type: String, required: true },

    numerosRestantes: {
        type: [Number],
        default: Array.from({ length: 89 }, (_, i) => i + 1)
    },

    numerosSalidos: {
        type: [Number],
        default: []
    },
    ultimoNumero: {
        type: Number,
        default: 0
    },
    activo: { type: Boolean, default: true }

}, { timestamps: true });

export default model("Bolillero", BolilleroSchema);
