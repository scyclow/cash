// SPDX-License-Identifier: MIT

// contract by steviep.eth

pragma solidity ^0.8.17;

interface IFastCashMoneyPlus {
  function transfer(address to, uint256 amount) external;
  function balanceOf(address) external view returns (uint256);
}

contract FastCashBidReward {
  address public minter;
  address public owner;

  IFastCashMoneyPlus fastCash = IFastCashMoneyPlus(0xcA5228D1fe52D22db85E02CA305cddD9E573D752);

  constructor() {
    owner = msg.sender;
  }


  function mint(address recipient) external {
    require(msg.sender == minter);
    if (fastCash.balanceOf(address(this)) >= 1 ether) {
      fastCash.transfer(recipient, 1 ether);
    }
  }

  function withdraw(uint256 amount) external {
    require(msg.sender == owner);
    fastCash.transfer(msg.sender, amount);
  }

  function setMinter(address newMinter) external {
    require(msg.sender == owner);
    minter = newMinter;
  }

  function transferOwnership(address newOwner) external {
    require(msg.sender == owner);
    owner = newOwner;
  }
}