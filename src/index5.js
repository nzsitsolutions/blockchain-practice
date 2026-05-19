const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
//  BLOCKCHAIN COMPLETO — Node.js crypto
//  Cubre: wallets, transacciones firmadas, bloques, cadena,
//         validación de integridad, detección de tamper, saldos
// ═══════════════════════════════════════════════════════════════


// ── 1. UTILIDAD: SHA-256 ────────────────────────────────────────

function sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}


// ── 2. WALLETS ──────────────────────────────────────────────────
// Claves en formato DER (Buffer binario, no string PEM).
// Dirección estilo Ethereum: "0x" + últimos 40 hex del hash de pubKey.

function generarWallet(nombre) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding:  { type: 'spki',  format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });

    const direc = '0x' + sha256(publicKey).slice(-40);

    return { nombre, direc, privateKey, publicKey };
}

// Firmar datos con clave privada DER
function firmar(data, privateKeyDer) {
    return crypto.sign(
        'sha256',
        Buffer.from(data),
        { key: privateKeyDer, format: 'der', type: 'pkcs8' }
    );
}

// Verificar firma con clave pública DER
function verificarFirma(data, publicKeyDer, firma) {
    return crypto.verify(
        'sha256',
        Buffer.from(data),
        { key: publicKeyDer, format: 'der', type: 'spki' },
        firma
    );
}


// ── 3. TRANSACCIONES ────────────────────────────────────────────
// Cada tx tiene: datos en texto, hash de esos datos, firma del emisor.

function crearTransaccion(wallet, destino, monto) {
    const datos = `${wallet.direc}→${destino}:${monto}`;
    const hash  = sha256(datos);
    const firma = firmar(datos, wallet.privateKey);
    return { datos, hash, firma, de: wallet.direc, para: destino, monto };
}

function verificarTransaccion(tx, publicKeyDer) {
    // 1. Integridad: hash coincide con datos
    if (sha256(tx.datos) !== tx.hash) return false;
    // 2. Autenticidad: firma válida con la clave pública del emisor
    return verificarFirma(tx.datos, publicKeyDer, tx.firma);
}


// ── 4. BLOQUES ──────────────────────────────────────────────────
// Hash del bloque cubre: index + timestamp + hashes de todas las tx + hashAnterior.
// Si cualquier tx cambia → el hash del bloque cambia → cadena se rompe.

function crearBloque(index, transacciones, hashAnterior) {
    const timestamp   = new Date().toISOString();
    const hashTxs     = sha256(transacciones.map(tx => tx.hash).join(''));
    const contenido   = `${index}${timestamp}${hashTxs}${hashAnterior}`;
    const hash        = sha256(contenido);
    return { index, timestamp, transacciones, hashTxs, hashAnterior, hash };
}

function recalcularHashBloque(bloque) {
    const hashTxs   = sha256(bloque.transacciones.map(tx => tx.hash).join(''));
    const contenido = `${bloque.index}${bloque.timestamp}${hashTxs}${bloque.hashAnterior}`;
    return sha256(contenido);
}


// ── 5. CADENA ───────────────────────────────────────────────────

function validarCadena(bloques, wallets) {
    for (let i = 0; i < bloques.length; i++) {
        const b = bloques[i];

        // Hash interno del bloque es coherente
        if (recalcularHashBloque(b) !== b.hash)
            return { valid: false, corrupto: i, motivo: 'hash de bloque manipulado' };

        // Eslabón con bloque anterior correcto
        if (i > 0 && b.hashAnterior !== bloques[i - 1].hash)
            return { valid: false, corrupto: i, motivo: 'cadena rota (hashAnterior no coincide)' };

        // Verificar cada transacción dentro del bloque
        for (const tx of b.transacciones) {
            if (tx.de === 'SISTEMA') continue; // tx coinbase no tiene firma

            const wallet = wallets.find(w => w.direc === tx.de);
            if (!wallet)
                return { valid: false, corrupto: i, motivo: `wallet desconocido: ${tx.de}` };

            if (!verificarTransaccion(tx, wallet.publicKey))
                return { valid: false, corrupto: i, motivo: `firma inválida en tx: ${tx.datos}` };
        }
    }
    return { valid: true };
}


// ── 6. SALDOS ───────────────────────────────────────────────────
// Recorre toda la cadena y reconstruye el estado de saldos.

const GAS_FEE = 0.001;

function calcularSaldos(bloques) {
    const saldos = {};

    for (const bloque of bloques) {
        for (const tx of bloque.transacciones) {
            if (tx.de !== 'SISTEMA') {
                saldos[tx.de] = (saldos[tx.de] || 0) - tx.monto - GAS_FEE;
            }
            saldos[tx.para] = (saldos[tx.para] || 0) + tx.monto;
        }
    }

    return saldos;
}


// ════════════════════════════════════════════════════════════════
//  DEMO
// ════════════════════════════════════════════════════════════════

console.log('\n═══ GENERANDO WALLETS ═══');
const walletMati  = generarWallet('Mati');
const walletAna   = generarWallet('Ana');
const walletCarlos = generarWallet('Carlos');

console.log(`Mati:   ${walletMati.direc}`);
console.log(`Ana:    ${walletAna.direc}`);
console.log(`Carlos: ${walletCarlos.direc}`);


// ── Bloque 0: Génesis ──
// Transacción coinbase: el sistema acredita saldo inicial a Mati
console.log('\n═══ BLOQUE 0: GÉNESIS ═══');

const txCoinbase = {
    datos: 'SISTEMA→' + walletMati.direc + ':10',
    hash:  sha256('SISTEMA→' + walletMati.direc + ':10'),
    firma: Buffer.from('coinbase'),
    de:    'SISTEMA',
    para:  walletMati.direc,
    monto: 10,
};

const bloque0 = crearBloque(0, [txCoinbase], '0000000000000000');
console.log(`Hash bloque 0: ${bloque0.hash.slice(0, 20)}...`);


// ── Bloque 1: Mati → Ana ──
console.log('\n═══ BLOQUE 1: TRANSACCIONES ═══');

const tx1 = crearTransaccion(walletMati, walletAna.direc, 3);
const tx2 = crearTransaccion(walletMati, walletCarlos.direc, 1.5);

console.log(`tx1 válida: ${verificarTransaccion(tx1, walletMati.publicKey)}`);
console.log(`tx2 válida: ${verificarTransaccion(tx2, walletMati.publicKey)}`);

const bloque1 = crearBloque(1, [tx1, tx2], bloque0.hash);
console.log(`Hash bloque 1: ${bloque1.hash.slice(0, 20)}...`);


// ── Bloque 2: Ana → Carlos ──
console.log('\n═══ BLOQUE 2: MÁS TRANSACCIONES ═══');

const tx3 = crearTransaccion(walletAna, walletCarlos.direc, 1);
const bloque2 = crearBloque(2, [tx3], bloque1.hash);
console.log(`Hash bloque 2: ${bloque2.hash.slice(0, 20)}...`);


// ── Cadena ──
const cadena = [bloque0, bloque1, bloque2];
const wallets = [walletMati, walletAna, walletCarlos];


// ── Validar cadena íntegra ──
console.log('\n═══ VALIDACIÓN DE CADENA ═══');
let resultado = validarCadena(cadena, wallets);
console.log('Cadena válida:', resultado);


// ── Saldos ──
console.log('\n═══ SALDOS ═══');
const saldos = calcularSaldos(cadena);
for (const [direc, saldo] of Object.entries(saldos)) {
    const nombre = wallets.find(w => w.direc === direc)?.nombre || 'SISTEMA';
    console.log(`  ${nombre} (${direc.slice(0, 10)}...): ${saldo.toFixed(4)} ETH`);
}


// ── Intento de tamper ──
console.log('\n═══ INTENTO DE TAMPER ═══');
console.log('Modificando tx1: cambia 3 ETH → 300 ETH...');

const montoPrevio = tx1.monto;
tx1.datos  = tx1.datos.replace(':3', ':300');
tx1.monto  = 300;
// el hash de tx1 ya no coincide con sus datos → el hash del bloque1 tampoco

resultado = validarCadena(cadena, wallets);
console.log('Cadena válida tras tamper:', resultado);

// restaurar para mostrar que la validación pasa si se revierte
tx1.datos = tx1.datos.replace(':300', ':3');
tx1.monto = montoPrevio;
resultado = validarCadena(cadena, wallets);
console.log('Cadena válida tras revertir:', resultado);


// ── Intento de firma falsa ──
console.log('\n═══ FIRMA FALSA (Ana intenta gastar con clave de Mati) ═══');
const txFalsa = crearTransaccion(walletAna, walletCarlos.direc, 5);
// verificar con publicKey de MATI → debe fallar
const firmadaPorMati = verificarFirma(txFalsa.datos, walletMati.publicKey, txFalsa.firma);
const firmadaPorAna  = verificarFirma(txFalsa.datos, walletAna.publicKey,  txFalsa.firma);
console.log(`¿Firmada por Mati?  ${firmadaPorMati}`);  // false
console.log(`¿Firmada por Ana?   ${firmadaPorAna}`);   // true
