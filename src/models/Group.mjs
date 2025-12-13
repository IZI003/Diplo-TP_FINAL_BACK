import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);
