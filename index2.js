const crypto = require('crypto');

// generar par de claves (en ETH real esto usa curva secp256k1)
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1' // simplificación, ETH usa secp256k1
});

const mensaje = "Enviar 1 ETH a 0xABC...";

// firmar con clave privada
const firma = crypto.sign('sha256', Buffer.from(mensaje), privateKey);
console.log('firma:', firma.toString('hex').slice(0, 40) + '...');

// verificar con clave pública (cualquiera puede hacer esto)
const esValida = crypto.verify('sha256', Buffer.from(mensaje), publicKey, firma);
console.log('¿firma válida?', esValida); // true

// si alguien modifica el mensaje...
const mensajeFalso = "Enviar 1000 ETH a 0xABC...";
const esValidaFalso = crypto.verify('sha256', Buffer.from(mensajeFalso), publicKey, firma);
console.log('¿Mensaje modificado válido?', esValidaFalso); // false ❌