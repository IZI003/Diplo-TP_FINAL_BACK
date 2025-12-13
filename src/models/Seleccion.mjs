import mongoose from "mongoose";

const SeleccionSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        // Array de IDs de cartones
        cartones: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Carton",
                required: true
            }
        ]
    },
    {
        timestamps: true
    }
);

const Seleccion = mongoose.model("Seleccions", SeleccionSchema);

export default Seleccion;
