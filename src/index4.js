const crypto = require('crypto');

function generarWallet() {
    let publicKeyEncoding = { type: "spki", format: "der" }

    let privateKeyEncoding = { type: "pkcs8", format: "der" }

    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec',
        {
            namedCurve: 'prime256v1',
            publicKeyEncoding,
            privateKeyEncoding
        }
    );

    const direc = '0x' + crypto
        .createHash('sha256')
        .update(publicKey)
        .digest('hex')
        .slice(-40)

    return {
        direc,
        clavePublicaHex: publicKey.toString('hex').slice(0, 20) + '...',
        clavePrivadaHex: '[PRIVADA - NO COMPARTIR]'
    };
}

function simularTransferencia(origen, destino, monto, saldos) {
    if (!saldos[origen] || saldos[origen] < monto) {
        console.log('saldo insuficiente');
        return saldos;
    }

    const GAS_FEE = 0.001;
    saldos[origen] -= (monto + GAS_FEE);
    saldos[destino] = (saldos[destino] || 0) + monto;

    console.log(`transferidos ${monto} ETH de ${de.slice(0.8)}... a ${para.slice(0, 8)}...`);
    console.log(`    Gas fee: ${GAS_FEE} ETH`);

    return saldos;
}

const walletMati = generarWallet();
const walletAna = generarWallet();

let saldos = {
    [walletMati.direccion]: 2.5,
    [walletAna.direccion]: 0.0
}

console.log("saldos iniciales", saldos);

saldos = simularTransferencia(
    walletMati.direccion,
    walletAna.direccion,
    1.0,
    saldos
);

console.log("saldos finales", saldos);