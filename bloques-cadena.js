const crypto = require('crypto');
const bcrypt = require('bcrypt');

function crearBloque(index, datos, hashAnterior) {
    const timestamp = new Date().toISOString();
    const contenido = `${index}${timestamp}${datos}${hashAnterior}`;
    const hash = crypto.createHash('sha256').update(contenido).digest('hex');

    return { index, timestamp, datos, hashAnterior, hash };
}

function modificarDatos(bloque, dato) {
    bloque.datos = dato;
    bloque.timestamp = new Date().toISOString();
    const contenido = `${bloque.index}${bloque.timestamp}${bloque.datos}${bloque.hashAnterior}`;
    bloque.hash = crypto.createHash('sha256').update(contenido).digest('hex');
}

function validarCadena(bloques) {
    bloques.forEach((b, i) => {
        if (recalcularHash(b) !== b.hash) {
            return { valid: false, corrupto: i, motivo: "hash interno manipulado" }
        }

        if (i > 0 && b.hash !== bloques[i - 1].hash) {
            return { valid: false, corrupto: i, motivo: "cadena rota" };
        };
    });

    return { valid: true };
}

function recalcularHash(bloque) {
    // mismo cálculo que cuando se creó el bloque
    const contenido = `${bloque.index}${bloque.timestamp}${bloque.datos}${bloque.hashAnterior}`;
    return crypto.createHash('sha256').update(contenido).digest('hex');
}

let bloques = [];

// bloque génesis (el primero, no tiene anterior)
const bloque0 = crearBloque(0, "Génesis", "0000");
bloques.push(bloque0);

// bloque 1, encadenado al 0
const bloque1 = crearBloque(1, "Mati → Ana: 1 ETH", bloque0.hash);
bloques.push(bloque1);

// bloque 2, encadenado al 1
const bloque2 = crearBloque(2, "Ana → Carlos: 0.5 ETH", bloque1.hash);
bloques.push(bloque2);

// intentemos "hackear" el bloque 0
dato = "Mati → Ana: 1000 ETH"; // modificamos datos
modificarDatos(bloque0, dato);

validationResult = validarCadena(bloques);

console.log(`validation result: ${JSON.stringify(validationResult)}`);
