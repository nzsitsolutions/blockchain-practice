const crypto = require('crypto');
const { buffer } = require('stream/consumers');

function crearHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'
});

function crearTransaccion(de, para, monto, clavePrivada) {
    const datos = `${de}→${para}:${monto}`;
    const hash = crearHash(datos);
    const firma = crypto.sign('sha256', Buffer.from(datos), clavePrivada);

    return { datos, firma, hash };
}

function verificarTransaccion(transaccion, clavePublica) {
    if(recalcularHash(transaccion.datos) !== transaccion.hash) return false;

    return crypto.verify('sha256', Buffer.from(transaccion.datos), clavePublica, transaccion.firma);
}

function recalcularHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

const tx1 = crearTransaccion("matx.eth", "an.eth", 3, privateKey);
console.log(tx1);

const valida = verificarTransaccion(tx1, publicKey);
console.log("transaccion valida?", valida);