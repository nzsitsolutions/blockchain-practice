// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Arquitectura de ERC-3643 — token para activos del mundo real con KYC on-chain

// 1. Identity Registry — el KYC on-chain
contract IdentityRegistry {

  struct Identity {
    // datos de identidad verificada
  }

  mapping(address => Identity) public identities;

  function isVerified(address wallet) external view returns (bool) {}

  function registerIdentity(address wallet, Identity calldata id) external {}
}

// 2. Compliance — las reglas de negocio
contract Compliance {

  // ¿Ambas wallets tienen KYC? ¿Límites de inversión?
  // ¿Jurisdicción permitida? ¿Lockup period?
  function canTransfer(address from, address to, uint256 amount) external view returns (bool) {}
}

// 3. Token — el token en sí
contract Token {

  Compliance public compliance;

  function transfer(address to, uint256 amount) external {
    require(compliance.canTransfer(msg.sender, to, amount));
    // solo transfiere si compliance lo aprueba
  }

  function freeze(address wallet) external {}

  function forcedTransfer(address from, address to, uint256 amount) external {} // para reguladores
}
