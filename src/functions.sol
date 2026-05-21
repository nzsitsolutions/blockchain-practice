// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Funciones — los puntos de entrada
contract LadrilloToken {

  // ── Variables de estado ────────────────────────────────────────────────────
  address public owner;
  bool public paused;
  uint256 public totalSupply;
  mapping(address => uint256) public balances;
  mapping(address => bool) public whitelist;
  mapping(address => bool) public frozen;
  mapping(address => uint256) public rentOwed;
  address[] public holders;

  // ── Eventos ────────────────────────────────────────────────────────────────
  event TokensPurchased(address indexed buyer, uint256 amount, uint256 timestamp);
  event WhitelistUpdated(address indexed wallet, bool status);
  event WalletFrozen(address indexed wallet);
  event RentDistributed(uint256 totalAmount);
  event ContractPaused(uint256 timestamp);
  event ContractUnpaused(uint256 timestamp);

  // ── Modificadores ──────────────────────────────────────────────────────────
  modifier onlyOwner() { require(msg.sender == owner); _; }
  modifier onlyWhitelisted() { require(whitelist[msg.sender]); _; }
  modifier whenNotPaused() { require(!paused); _; }

  // ── Lectura (view) — gratis, sin firma, instantáneo ───────────────────────
  function balanceOf(address acc) public view returns (uint256) {
    return balances[acc];
  }

  // ── Escritura usuario — cuesta gas, necesita firma ────────────────────────
  function buyTokens(uint256 amount) public onlyWhitelisted whenNotPaused {
    balances[msg.sender] += amount;
    totalSupply += amount;
    emit TokensPurchased(msg.sender, amount, block.timestamp);
  }

  // ── Admin — solo tu wallet owner ──────────────────────────────────────────
  function addToWhitelist(address wallet) external onlyOwner {
    whitelist[wallet] = true;
    emit WhitelistUpdated(wallet, true);
  }

  function freeze(address wallet) external onlyOwner {
    whitelist[wallet] = false;
    frozen[wallet] = true;
    emit WalletFrozen(wallet);
  }

  function distributeRent(uint256 totalRent) external onlyOwner whenNotPaused {
    require(totalRent > 0, "Monto invalido");
    for (uint256 i = 0; i < holders.length; i++) {
      address holder = holders[i];
      uint256 share = (balances[holder] * totalRent) / totalSupply;
      rentOwed[holder] += share;
    }
    emit RentDistributed(totalRent);
  }

  function pause() external onlyOwner {
    paused = true;
    emit ContractPaused(block.timestamp);
  }

  function unpause() external onlyOwner {
    paused = false;
    emit ContractUnpaused(block.timestamp);
  }
}
