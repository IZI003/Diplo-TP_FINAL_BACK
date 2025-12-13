import express from 'express';
import {
    generarCartonesController, getCartonHTMLController, generarCartonesHTMLController,
    getCartonJSONController, generarCartonesJSONController, actualizarCartonController,
    eliminarCartonController, listarCartonesController
} from '../controllers/BingoController.mjs';

import {
    guardarSeleccionController,
    obtenerSeleccionController,
    eliminarSeleccionController
} from "../controllers/SeleccionController.mjs";

import {
    createUserController,
    listUsersController,
    getUserController,
    updateUserController,
    deleteUserController
} from "../controllers/userController.mjs";

import { loginController, registerController } from '../controllers/AuthController.mjs';
import { bolilleroController, sacarBolillaController } from '../controllers/BolilleroController.mjs';
import {
    cambiarGrupoActivoController, crearGrupoController, eliminarUsuarioDelGrupoController,
    generarInvitacionController, listarUsuariosGrupoController, obtenerGruposDeUsuarioController,
    previewGrupoController, unirseGrupoController
} from '../controllers/GrupoController.mjs';
import { authMiddleware } from '../middle/authMiddleware.mjs';
import { esAdminDelGrupo } from '../middle/esAdminDelGrupo.mjs';


const router = express.Router();
// Rutas API
// Generar cartones: opcionalmente pasar cantidad en la ruta: /bingo/generar/100
// Generar cartones: GET (por ruta) o POST (body) para generar N
router.post('/api/bingo/generar', authMiddleware, generarCartonesController); // acepta { cant: number } en body
// Listado paginado de cartones generados (query: page, limit)
router.get('/api/bingo/generar', listarCartonesController);

// CRUD sobre cartones
router.get('/api/bingo/carton/:id/json', authMiddleware, getCartonJSONController);
router.put('/api/bingo/carton/:id', authMiddleware, actualizarCartonController);
router.delete('/api/bingo/carton/:id', authMiddleware, eliminarCartonController);

// HTML endpoints para cartones
router.get('/api/bingo/carton/:id/html', authMiddleware, getCartonHTMLController);
router.get('/api/bingo/generar/:cant/html', authMiddleware, generarCartonesHTMLController);
router.get('/api/bingo/generar/:cant/json', authMiddleware, generarCartonesJSONController);

router.post("/api/bingo/seleccion", authMiddleware, guardarSeleccionController);
router.get("/api/bingo/seleccion/:userId", authMiddleware, obtenerSeleccionController);
router.delete("/api/bingo/seleccion/:userId", authMiddleware, eliminarSeleccionController);

router.post("/api/users/", createUserController);            // POST /users
router.get("/api/users/", listUsersController);              // GET /users?page=1&limit=20
router.get("/api/users/:id", getUserController);             // GET /users/:id
router.put("/api/users/:id", authMiddleware, updateUserController);          // PUT /users/:id
router.delete("/api/users/:id", authMiddleware, deleteUserController);       // DELETE /users/:id

router.post("/api/auth/login", loginController);                 // POST /auth/login
router.post("/api/auth/register", registerController);                 // POST /auth/register



router.post("/api/bolillero/sacar", sacarBolillaController);
router.get("/api/bolillero/estado/:grupoId", bolilleroController);

router.post("/api/grupos", crearGrupoController);
router.get("/api/grupos/:userId", obtenerGruposDeUsuarioController);
router.put("/api/grupos/activar/:userId/:groupId", cambiarGrupoActivoController);
router.post("/api/grupos/:groupId/invitar", authMiddleware, esAdminDelGrupo, generarInvitacionController);

// Listar usuarios del grupo (solo admin)
router.get("/api/grupos/:groupId/usuarios", authMiddleware, esAdminDelGrupo, listarUsuariosGrupoController);

// Eliminar usuario del grupo (solo admin)
router.delete("/api/grupos/:groupId/usuarios/:userId", authMiddleware, esAdminDelGrupo, eliminarUsuarioDelGrupoController);

router.get("/api/grupos/preview/:token", previewGrupoController);
// Unirse a un grupo usando token de invitación
router.post("/api/grupos/unirse/:token", authMiddleware, unirseGrupoController);


export default router;