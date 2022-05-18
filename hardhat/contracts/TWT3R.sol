// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol"; // DEBUG

contract TWT3R is ERC20, Ownable {
  constructor() ERC20("Twitt3r", "TWT3R") {
    _mint(msg.sender, 1000000 * 10 ** decimals());
  }

  function pause() public onlyOwner {
    _pause();
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function burn(uint256 amount) public {
    _burn(msg.sender, amount);
  }

  function burnFrom(address account, uint256 amount) public {
    _spendAllowance(account, msg.sender, amount);
    _burn(account, amount);
  }

  function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
    super._beforeTokenTransfer(from, to, amount);
  }
}
