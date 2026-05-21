// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Funciones — los puntos de entrada
contract LadrilloToken {

  bool public paused;
  uint256 public totalSupply;
  mapping(address => uint256) public balances;
  mapping(address => bool) public whitelist;

  event TokensPurchased(address indexed buyer, uint256 amount, uint256 timestamp);

  modifier onlyWhitelisted() { require(whitelist[msg.sender]); _; }
  modifier whenNotPaused() { require(!paused); _; }

  // Lee estado — gratis, sin firma, instantáneo
  function balanceOf(address acc) public view returns (uint256) {
    return balances[acc];
  }

  // Escribe estado — cuesta gas, necesita firma
  function buyTokens(uint256 amount) public onlyWhitelisted whenNotPaused {
    balances[msg.sender] += amount;
    totalSupply += amount;
    emit TokensPurchased(msg.sender, amount, block.timestamp);
  }
}
