import Carton from '../models/Carton.mjs';

// --- Generar y guardar ---
export async function generarCartones(cantidad = 200) {
    try {

        console.log(`Conectado a MongoDB. Generando ${cantidad} cartones únicos...`);
        const cards = await generateUniqueCards(cantidad);
        if (!cards || cards.length === 0) {
            return { error: true, message: 'No se pudieron generar cartones' };
        }
        const docs = [];
        for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            if (!c || !c.matrix || !c.card) {
                console.warn('Carton generado inválido, se omite', { index: i, carton: c });
                continue;
            }
            const flat = Array.isArray(c.card) ? c.card.flat().filter(n => n !== null) : [];
            const signature = Array.isArray(c.card) ? c.card.flat().map(x => x === null ? '' : String(x)).join(',') : '';
            docs.push({
                codigo: `CARTON-${String(docs.length + 1).padStart(3, '0')}`,
                matrix: c.matrix,
                numeros: c.card,
                numeros_flat: flat,
                signature: signature
            });
        }

        if (docs.length === 0) {
            return { error: true, message: 'No hay docs válidos para insertar' };
        }

        const res = await Carton.insertMany(docs, { ordered: false });
        console.log(`✅ ${res.length} cartones insertados en la colección.`);
        // Devolver documentos insertados para que el controlador los procese
        return res;
    } catch (err) {
        // Si hubo errores (por ejemplo duplicados en insertMany), los retornamos
        console.error('❌ Error generando cartones:', err);
        return { error: true, message: err.message, details: err }; 
    }
}


function columnRange(colIndex) {
    if (colIndex === 9) return { min: 81, max: 90 };
    const min = (colIndex - 1) * 10 + 1;
    const max = (colIndex - 1) * 10 + 10;
    return { min, max };
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Genera una distribución de conteos por columna (c_i ∈ {1,2,3}) tal que suma = 15
 * Empieza con 1 en cada columna (suma=9) y reparte los 6 restantes aleatoriamente sin exceder 3.
 */
function generateColumnCounts() {
    const counts = Array(9).fill(1);
    let remaining = 15 - 9; // 6
    const columns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    while (remaining > 0) {
        shuffle(columns);
        for (const c of columns) {
            if (remaining <= 0) break;
            if (counts[c] < 3) {
                // con algo de aleatoriedad, agregar o no
                if (Math.random() < 0.7) { // bias para rellenar
                    counts[c]++;
                    remaining--;
                }
            }
        }
    }
    return counts;
}

/**
 * Dado counts por columna (suma 15), construye la matriz 3x9 de ocupación (0/1)
 * con restricciones: cada fila suma exactamente 5.
 * Algoritmo: backtracking por columnas. Es pequeño (9 columnas) y rápido.
 */
function buildPositionMatrix(counts) {
    const rows = 3, cols = 9;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    const targetRowSums = Array(rows).fill(5);

    // precompute all row-combinations per possible column count
    const combosByCount = {
        1: [[0], [1], [2]],
        2: [[0, 1], [0, 2], [1, 2]],
        3: [[0, 1, 2]]
    };

    function backtrack(col) {
        if (col === cols) {
            // check row sums satisfied
            return targetRowSums.every(s => s === 0);
        }
        const need = counts[col];
        const combos = combosByCount[need];
        // randomize order to diversify
        const order = shuffle([...combos]);
        for (const comb of order) {
            // check feasibility
            let ok = true;
            for (const r of comb) {
                if (targetRowSums[r] <= 0) { ok = false; break; }
            }
            if (!ok) continue;
            // apply
            for (const r of comb) { matrix[r][col] = 1; targetRowSums[r]--; }
            if (backtrack(col + 1)) return true;
            // undo
            for (const r of comb) { matrix[r][col] = 0; targetRowSums[r]++; }
        }
        return false;
    }

    const success = backtrack(0);
    if (!success) return null;
    return matrix;
}

/**
 * Asigna números a las celdas ocupadas usando rango por columna.
 * Asegura que en cada columna los números sean distintos y ordenados por fila (ascendente),
 * que es el formato clásico: números en una columna aparecen de menor (fila superior) a mayor (fila inferior).
 */
function fillNumbers(matrix) {
    const rows = 3, cols = 9;
    const card = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (let c = 0; c < cols; c++) {
        const { min, max } = columnRange(c + 1);
        // generate the pool and pick distinct numbers equal to column occupancy
        const pool = [];
        for (let n = min; n <= max; n++) pool.push(n);
        shuffle(pool);
        const need = matrix.reduce((acc, row) => acc + (row[c] ? 1 : 0), 0);
        const chosen = pool.slice(0, need).sort((a, b) => a - b);
        // place chosen numbers top-to-bottom in rows that are occupied
        let idx = 0;
        for (let r = 0; r < rows; r++) {
            if (matrix[r][c]) {
                card[r][c] = chosen[idx++];
            } else {
                card[r][c] = null;
            }
        }
    }
    return card;
}

/**
 * Crea un "signature" para detectar duplicados.
 * Combina posición (ocupación) + números (opcional).
 * Para mayor robustez en evitar repeticiones, incluimos números en la firma.
 */
function cardSignature(matrix, cardNumbers) {
    // positions: string de 27 chars 0/1, numbers: join con '-' usando '' para null
    let pos = '';
    if (!matrix || !Array.isArray(matrix)) {
        // no hay matriz válida
        pos = '000000000000000000000000000';
    } else {
        for (let r = 0; r < 3; r++) {
            const row = matrix[r] || [];
            for (let c = 0; c < 9; c++) pos += (row[c] ? '1' : '0');
        }
    }
    const nums = [];
    if (!cardNumbers) {
        // si no hay números, devolvemos solo la posición
        return pos + '|';
    }
    for (let r = 0; r < 3; r++) {
        const row = cardNumbers[r] || [];
        for (let c = 0; c < 9; c++) {
            const cell = row[c];
            nums.push(cell === null || cell === undefined ? '' : String(cell));
        }
    }
    return pos + '|' + nums.join(',');
}

/**
 * Genera un cartón único (matriz de números) con las reglas
 */
export async function generateCard() {
    // loop hasta conseguir una matriz válida (puede fallar ocasionalmente)
    for (let attempts = 0; attempts < 50; attempts++) {
        try {
            const counts = generateColumnCounts();
            const matrix = buildPositionMatrix(counts);
            if (!matrix) continue;
            const card = fillNumbers(matrix);
            if (!card) continue;
            // validaciones finales:
            const flat = card.flat();
            const total = Array.isArray(flat) ? flat.filter(x => x !== null).length : 0;
            if (total !== 15) continue;
            return { matrix, card };
        } catch (err) {
            console.error('Error en generateCard (intento):', { attempts, err: err.message });
            continue;
        }
    }
    throw new Error('No se pudo generar cartón válido tras varios intentos');
}

/**
 * Genera hasta N cartones únicos (evita repeticiones por signature).
 * Devuelve array de objetos { matrix, card }
 */
export async function generateUniqueCards(n, maxAttempts = 100000) {
    const results = [];
    const seen = new Set();
    let attempts = 0;
    while (results.length < n && attempts < maxAttempts) {
        attempts++;
        try {
            const generated = await generateCard();
            if (!generated) continue;
            const { matrix, card } = generated;
            const sig = cardSignature(matrix, card);
            if (!seen.has(sig)) {
                seen.add(sig);
                results.push({ matrix, card });
            }
        } catch (err) {
            console.error('Error generando carta en generateUniqueCards:', err.message);
            continue;
        }
    }
    return results;
}

/**
 * HTML imprimible de un cartón (tabla simple)
 */
export async function renderCardHTML(card) {
    // card puede ser:
    // - una matriz 3x9 directamente
    // - un objeto con propiedad `numeros` (guardado en DB)
    // - un objeto con propiedad `card` (estructura interna)
    let grid = null;
    let meta = {};
    if (!card) grid = Array.from({ length: 3 }, () => Array(9).fill(null));
    else if (Array.isArray(card)) grid = card;
    else if (card.numeros) grid = card.numeros;
    else if (card.card) grid = card.card;
    else grid = Array.from({ length: 3 }, () => Array(9).fill(null));

    // meta info si está disponible
    if (card && typeof card === 'object') {
        meta.codigo = card.codigo || card.code || null;
        meta.signature = card.signature || null;
    }

    // asegurar forma 3x9
    const rows = 3, cols = 9;
    const safe = Array.from({ length: rows }, (_, r) => {
        const row = Array.isArray(grid[r]) ? grid[r].slice(0, cols) : [];
        const padded = Array.from({ length: cols }, (_, c) => (row[c] === undefined ? null : row[c]));
        return padded;
    });

    const styleTable = 'border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;margin:8px 0;';
    const styleCell = 'border:1px solid #333;padding:8px;width:40px;height:34px;text-align:center;font-weight:600;';

    let html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cartón</title></head><body>`;
    if (meta.codigo) html += `<div style="margin-bottom:8px;font-weight:700;">Código: ${meta.codigo}</div>`;
    html += `<table style="${styleTable}"><tbody>`;

    for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
            const cellVal = safe[r][c] === null ? '' : String(safe[r][c]);
            html += `<td style="${styleCell}">${cellVal}</td>`;
        }
        html += '</tr>';
    }

    html += '</tbody></table>';
    if (meta.signature) html += `<div style="margin-top:6px;font-size:12px;color:#666;">Signature: ${meta.signature}</div>`;
    html += '</body></html>';
    return html;
}
