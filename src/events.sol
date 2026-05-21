// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Eventos — logs inmutables de lo que pasó
contract LadrilloToken {

  event TokensPurchased(
    address indexed buyer, // "indexed" = filtrable
    uint256 amount,
    uint256 timestamp
  );
  event WalletFrozen(address indexed wallet);
  event RentDistributed(uint256 totalAmount);
  event WhitelistUpdated(address indexed wallet, bool status);

  function example() internal {
    // Los eventos se emiten dentro de las funciones:
    emit TokensPurchased(msg.sender, 1000, block.timestamp);
  }
}
