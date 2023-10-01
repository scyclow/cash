// SPDX-License-Identifier: MIT



pragma solidity ^0.8.17;

contract UniswapV2Mock {
  function getReserves() external view returns (uint112, uint112, uint32) {
    return (
      uint112(29954418357284),
      uint112(15982938777635119725700),
      uint32(block.timestamp)
    );
  }
}

contract AllowListMock {
  mapping(address => uint256) public balanceOf;

  function setBalance(address addr, uint256 balance) external {
    balanceOf[addr] = balance;
  }
}
