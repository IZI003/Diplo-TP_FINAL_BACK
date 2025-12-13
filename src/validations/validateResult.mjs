import { validationResult } from 'express-validator';

export function validateResult(context = '') {
    return (req, res, next) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) return next();

        // Retornar errores en formato JSON; el comportamiento puede cambiar según necesidad
        return res.status(400).json({ ok: false, context, errors: errors.array() });
    };
}
