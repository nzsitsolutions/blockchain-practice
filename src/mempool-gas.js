const crypto = require('crypto');

class Mempool {
    constructor() {
        this.pendientes = [];
    }

    agregarTx(tx) {
        this.pendientes.push(tx);

        this.pendientes.sort((a, b) => b.priorityFee - a.priorityFee);
        console.log(`tx agregada al mempool. Pendientes: ${this.pendientes.length}`);
    }

    minarBloque() {
        if (this.pendientes.length === 0) return null;

        const txsBloque = this.pendientes.slice(0, 3);

        const bloque = {
            numero: Date.now(),
            timestamp: new Date().toISOString(),
            transacciones: txsBloque,
            gasTotal: txsBloque.reduce((sum, tx) => sum + tx.gasUsado, 0)
        };

        console.log(`bloque minado con ${txsBloque.length} TXs`);
        return bloque;
    }
}

function crearTx(nonce, origen, destino, monto, priorityFee = 2) {
    const BASE_FEE = 15;
    const GAS_LIMIT = 21000;
    const gasUsado = 21000;
    const feeTotalGwei = (BASE_FEE + priorityFee) * gasUsado;
    const feeTotalEth = feeTotalGwei / 1e9;

    return {
        nonce,
        origen,
        destino,
        monto,
        priorityFee,
        gasUsado,
        feeTotalEth,
        estado: 'pendiente',
        hash: crypto.createHash('sha256')
            .update(`${nonce}${origen}${destino}${monto}${Date.now()}`)
    }
}

const mempool = new Mempool();

mempool.agregarTx(crearTx(1, "0xMati", "0xAna", 1.0, priorityFee = 5));
mempool.agregarTx(crearTx(1, "0xAna", "0xCarlos", 0.5, priorityFee = 1));
mempool.agregarTx(crearTx(2, "0xMati", "0xCarlos", 0.2, priorityFee = 3));

console.log("mempool ordenado por priorityFee:");

mempool.pendientes.forEach(tx =>
    console.log(`none: ${tx.nonce} | ${tx.origen}->${tx.destino} | ${tx.monto} ETH | fee: ${tx.priorityFee} gwei`)
);

console.log("\n");
const bloque = mempool.minarBloque();

console.log("bloque confirmado");

bloque.transacciones.forEach(tx =>
    console.log(`  [${tx.hash}] ${tx.origen}->${tx.destino} | ${tx.monto} ETH | fee: ${tx.feeTotalEth.toFixed(6)} gwei`)
);