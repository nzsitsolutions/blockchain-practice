// importamos libreria crypto
const crypto = require('crypto');

function generarWallet() {
    // genero par de claves (primary / public)
    const { private_key, public_key } = crypto.generateKeyPairSync(
        'ec',
        {
            namedCurve: 'prime256v1',
            publicKeyEncoding: { type: 'spki', format: 'der' },
            privateKeyEncoding: { type: 'pkcs8', format: 'der' }
        }
    );

    const direc = '0x' + crypto
        .createHash('sha256')
        .update(public_key)
        .digest('hex')
        .slice(-40)

    return {
        direc,
        clavePublicaHex: public_key.toString('hex').slice(0, 20) + '...',
        clavePrivadaHex: '[PRIVADA - NO COMPARTIR]'
    };
}

function simularTransferencia(de, para, monto, saldos) {
    if (!saldos[de] || saldos[de] < monto) {
        console.log('saldo insuficiente');
    }
}
