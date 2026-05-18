# Blockchain Cheatsheet — Node.js `crypto`

```js
const crypto = require('crypto');
```

---

## 1. Generar Hash SHA-256

```js
const hash = crypto.createHash('sha256').update(data).digest('hex');
```

- `data` puede ser string o Buffer
- `digest('hex')` → string hexadecimal de 64 chars

---

## 2. Crear Bloque

```js
function crearBloque(index, datos, hashAnterior) {
    const timestamp = new Date().toISOString();
    const contenido = `${index}${timestamp}${datos}${hashAnterior}`;
    const hash = crypto.createHash('sha256').update(contenido).digest('hex');
    return { index, timestamp, datos, hashAnterior, hash };
}

// Bloque génesis (hashAnterior = "0000")
const bloque0 = crearBloque(0, "Génesis", "0000");

// Bloque encadenado al anterior
const bloque1 = crearBloque(1, "Mati → Ana: 1 ETH", bloque0.hash);
```

---

## 3. Recalcular Hash de un Bloque

```js
function recalcularHash(bloque) {
    const contenido = `${bloque.index}${bloque.timestamp}${bloque.datos}${bloque.hashAnterior}`;
    return crypto.createHash('sha256').update(contenido).digest('hex');
}

// Verificar integridad de un bloque:
const integro = recalcularHash(bloque) === bloque.hash; // true = no fue manipulado
```

---

## 4. Validar Cadena de Bloques

```js
function validarCadena(bloques) {
    for (let i = 0; i < bloques.length; i++) {
        const b = bloques[i];

        // 1. Hash interno coherente
        if (recalcularHash(b) !== b.hash)
            return { valid: false, corrupto: i, motivo: "hash interno manipulado" };

        // 2. Eslabón correcto con el bloque anterior
        if (i > 0 && b.hashAnterior !== bloques[i - 1].hash)
            return { valid: false, corrupto: i, motivo: "cadena rota" };
    }
    return { valid: true };
}
```

> **Ojo:** en index.js hay un bug — la condición correcta es `b.hashAnterior !== bloques[i-1].hash`, no `b.hash !== bloques[i-1].hash`.

---

## 5. Generar Par de Claves (pública / privada)

```js
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'  // ETH real usa secp256k1, aquí es simplificación
});
```

- `privateKey` → sólo la tiene el dueño, **nunca se comparte**
- `publicKey` → dirección pública, cualquiera puede tenerla

---

## 6. Firmar Mensaje

```js
const mensaje = "Enviar 1 ETH a 0xABC...";

const firma = crypto.sign('sha256', Buffer.from(mensaje), privateKey);
// → Buffer (bytes crudos), mostrar como hex:
console.log(firma.toString('hex'));
```

---

## 7. Verificar Firma

```js
// Con el mensaje ORIGINAL + clave pública + firma → true
const esValida = crypto.verify('sha256', Buffer.from(mensaje), publicKey, firma);

// Con mensaje MODIFICADO → false (firma no coincide)
const mensajeFalso = "Enviar 1000 ETH a 0xABC...";
const invalida = crypto.verify('sha256', Buffer.from(mensajeFalso), publicKey, firma);
```

---

## 8. Crear Transacción (hash + firma)

```js
function crearTransaccion(de, para, monto, clavePrivada) {
    const datos = `${de}→${para}:${monto}`;
    const hash  = crypto.createHash('sha256').update(datos).digest('hex');
    const firma = crypto.sign('sha256', Buffer.from(datos), clavePrivada);
    return { datos, hash, firma };
}

const tx = crearTransaccion("matx.eth", "ana.eth", 3, privateKey);
```

---

## 9. Verificar Transacción

```js
function verificarTransaccion(tx, clavePublica) {
    // 1. Re-hashear datos y comparar
    const hashRecalc = crypto.createHash('sha256').update(tx.datos).digest('hex');
    if (hashRecalc !== tx.hash) return false;

    // 2. Validar firma criptográfica
    return crypto.verify('sha256', Buffer.from(tx.datos), clavePublica, tx.firma);
}

const valida = verificarTransaccion(tx, publicKey); // true
```

---

## Flujo Completo (mental model)

```
HASHING
  datos → SHA-256 → hash (fingerprint, no reversible)

BLOQUE
  (index + timestamp + datos + hashAnterior) → SHA-256 → hash
  cadena: cada bloque apunta al hash del anterior

FIRMA DIGITAL
  mensaje + privateKey → firma
  mensaje + publicKey + firma → true/false

TRANSACCIÓN
  datos → hash  (integridad: datos no fueron tocados)
  datos + privateKey → firma  (autenticidad: yo la mandé)
  verificar = re-hashear + re-verificar firma
```

---

## Recordatorio de Métodos

| Qué necesito              | Método                                                                 |
|---------------------------|------------------------------------------------------------------------|
| Hashear string            | `crypto.createHash('sha256').update(str).digest('hex')`               |
| Generar claves EC         | `crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' })`      |
| Firmar                    | `crypto.sign('sha256', Buffer.from(msg), privateKey)`                 |
| Verificar firma           | `crypto.verify('sha256', Buffer.from(msg), publicKey, firma)`         |
| Comparar hashes           | `recalcularHash(bloque) === bloque.hash`                              |
