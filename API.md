# API Bingo - Resumen rápido

Este documento resume los endpoints principales para gestionar y generar cartones de bingo.

Base URL: http://localhost:4000 (ajustar según `PORT`)

## Endpoints principales

1) Generar cartones (GET / POST)
- GET /bingo/generar/:cant
  - Genera `:cant` cartones y devuelve JSON con `inserted` y `cartones` (por defecto 200 si no se pasa cant).
- POST /bingo/generar
  - Body JSON: { "cant": 10 }
  - Genera `cant` cartones.
- GET /bingo/generar?page=1&limit=20
  - Devuelve listado paginado de cartones ya generados (no genera nuevos). Respuesta: { page, limit, total, totalPages, items }

2) Obtener un cartón
- GET /bingo/carton/:id/json
  - Obtiene un cartón por `_id` (ObjectId) o por `codigo` (ej: CARTON-001). Devuelve objeto cartón formateado (sin campos `comprado` ni `jugador_id`).
- GET /bingo/carton/:id/html
  - Devuelve HTML imprimible del cartón.

3) Actualizar un cartón
- PUT /bingo/carton/:id
  - Body JSON: campos a actualizar (por ejemplo `{ "comprado": true, "jugador_id": "..." }`).
  - No permite actualizar `codigo` ni `signature`.

4) Eliminar un cartón
- DELETE /bingo/carton/:id
  - Elimina por `_id` o `codigo`.

5) Endpoints HTML de generación
- GET /bingo/generar/:cant/html
  - Genera `:cant` cartones y devuelve un HTML con todos los cartones.

## Notas
- Las respuestas JSON devuelven cartones formateados por el renderizador (sin campos sensibles).
- Paginación `limit` está limitada entre 1 y 100 por petición.
- Para generar muchos cartones en lotes grandes, vigilar uso de memoria y tiempo de ejecución en el servidor.

## Ejemplos (PowerShell)

Generar 3 cartones (POST):

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"cant":3}' http://localhost:4000/bingo/generar
```

Listar página 2 (20 por página):

```powershell
Invoke-RestMethod 'http://localhost:4000/bingo/generar?page=2&limit=20'
```

Obtener cartón por código (JSON):

```powershell
Invoke-RestMethod 'http://localhost:4000/bingo/carton/CARTON-001/json'
```

Obtener HTML imprimible:

```powershell
Invoke-RestMethod 'http://localhost:4000/bingo/carton/CARTON-001/html'
```

---

Document created by assistant. Ajusta ejemplos según el puerto y host de despliegue.