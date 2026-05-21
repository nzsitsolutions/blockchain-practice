// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Modificadores — middleware de Solidity
contract LadrilloToken {

  address public owner;
  bool public paused;
  mapping(address => bool) public whitelist;

  modifier onlyOwner() {
    require(msg.sender == owner, "Solo admin");
    _; // acá se ejecuta la función si pasó el require
  }

  modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "Sin KYC");
    _;
  }

  modifier whenNotPaused() {
    require(!paused, "Contrato pausado");
    _;
  }

  // Se combinan en las funciones:
  function buyTokens() public onlyWhitelisted whenNotPaused {}
  function freeze() external onlyOwner {}
}
