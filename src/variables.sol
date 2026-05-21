// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Variables de estado — viven en la blockchain
contract LadrilloToken {

  address public owner;                        // La wallet que deployó el contrato. Tiene poderes de admin.
  bool public paused = false;                  // Si es true, la mayoría de funciones se bloquean.
  uint256 public totalSupply;                  // Total de tokens emitidos.
  mapping(address => uint256) public balances; // balances[0xABC] = 1000 → Juan tiene 1000 tokens
  mapping(address => bool) public whitelist;   // whitelist[0xABC] = true → Juan tiene KYC aprobado
}
