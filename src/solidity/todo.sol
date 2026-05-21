// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // ← versión del compilador

contract LadrilloToken {

  // ── VARIABLES DE ESTADO ────────────────────────────────────────────────────
  address public owner;
  bool public paused = false;
  mapping(address => uint256) public balances;
  mapping(address => bool) public whitelist;

  // ── EVENTOS ────────────────────────────────────────────────────────────────
  event TokensPurchased(address indexed buyer, uint256 amount);
  event WalletFrozen(address indexed wallet);

  // ── MODIFICADORES ──────────────────────────────────────────────────────────
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyWhitelisted() {
    require(whitelist[msg.sender]);
    _;
  }

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  // ── FUNCIONES ──────────────────────────────────────────────────────────────
  function buyTokens(uint256 amount) public onlyWhitelisted whenNotPaused {
    balances[msg.sender] += amount;
    emit TokensPurchased(msg.sender, amount);
  }

  function freeze(address wallet) external onlyOwner {
    whitelist[wallet] = false;
    emit WalletFrozen(wallet);
  }
}
