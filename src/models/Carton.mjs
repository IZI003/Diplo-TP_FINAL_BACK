import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CartonSchema = new Schema({
  codigo: { type: String, unique: true },
  matrix: [[Number]],
  numeros: [[Number]],
  numeros_flat: [Number],
  signature: { type: String, unique: true },
  comprado: { type: Boolean, default: false },
  jugador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  fecha_creacion: { type: Date, default: Date.now }
}, { timestamps: true });

const Carton = model('Carton', CartonSchema);

export default Carton;
