// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Eventos — logs inmutables de lo que pasó
contract LadrilloToken {

  // ── Tokens ─────────────────────────────────────────────────────────────────
  event TokensPurchased(
    address indexed buyer, // "indexed" = filtrable por herramientas externas
    uint256 amount,
    uint256 timestamp
  );

  // ── Whitelist / admin ──────────────────────────────────────────────────────
  event WhitelistUpdated(address indexed wallet, bool status);
  event WalletFrozen(address indexed wallet);

  // ── Renta ──────────────────────────────────────────────────────────────────
  event RentDistributed(uint256 totalAmount);

  // ── Estado del contrato ────────────────────────────────────────────────────
  event ContractPaused(uint256 timestamp);
  event ContractUnpaused(uint256 timestamp);

  function example() internal {
    // Los eventos se emiten dentro de las funciones:
    emit TokensPurchased(msg.sender, 1000, block.timestamp);
    emit WhitelistUpdated(msg.sender, true);
    emit RentDistributed(5000);
    emit ContractPaused(block.timestamp);
  }
}
