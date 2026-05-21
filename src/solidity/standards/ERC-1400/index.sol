// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ERC-1400 — agrega sobre ERC-20 controles de transferencia para activos regulados
interface IERC1400 {

  // Verifica si una transferencia es válida antes de ejecutarla
  function canTransfer(address to, uint256 amount) external view returns (bool);

  // Transferencia con datos adicionales (ej: motivo regulatorio)
  function transferWithData(address to, uint256 amount, bytes calldata data) external;

  // Si el emisor puede forzar transferencias (para reguladores)
  function isControllable() external view returns (bool);
}
