import { body } from 'express-validator';

export function registerValidationRules() {
    // Reglas mínimas de ejemplo; ajustar según los campos reales
    return [
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('codigo').optional().isAlphanumeric().withMessage('El código debe ser alfanumérico')
    ];
}
