import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg
            }))
        });
    }

    next();
}
// Middleware para redirigir con errores y mantener datos del formulario
export const handleValidationErrorsRedirect = (redirectPath) => {
    return (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Armamos el objeto de errores
            const errores = {};
            errors.array().forEach(error => {
                errores[error.path] = error.msg;
            });

            // Agregamos type global
            const response = { errores, type: "error" };

            // Serializamos para pasar por querystring
            const erroresStr = encodeURIComponent(JSON.stringify(response.errores));
            const dataStr = encodeURIComponent(JSON.stringify(req.body));
            const typeStr = encodeURIComponent(response.type);

            let url = redirectPath;
            if (req.params.id) {
                url = `${redirectPath}/${req.params.id}`;
            }
            const isApi = req.headers['accept']?.includes('application/json');

            if (isApi) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: response.errores
                });
            }

            // 👇 redirección con errores e info
            return res.redirect(`${url}?errores=${erroresStr}&info=${dataStr}&type=${typeStr}`);
        }

        next();
    };
};

