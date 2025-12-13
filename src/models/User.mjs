import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    //groupId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },

    grupos: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: [] }
    ],
    grupoActivo: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
});

export default model("User", UserSchema);