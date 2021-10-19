// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
  uint256 totalWaves;
  uint256 private seed;

  event NewWave(address indexed from, uint256 timestamp, string message);
  struct Wave {
    address waver;
    string message;
    uint256 timestamp;
  }

  Wave[] waves;
  mapping(address => uint256) public lastWavedAt;

  constructor() payable {
    console.log("This isn't just a contract, it's smart too :D");
  }

  // Send a message (wave) using the contract
  function wave(string memory _message) public {
    require(
      lastWavedAt[msg.sender] + 5 minutes < block.timestamp,
      "Please wait 5 minutes before waving again!"
    );
    lastWavedAt[msg.sender] = block.timestamp;

    totalWaves += 1;
    console.log("%s has waved!", msg.sender);

    waves.push(Wave(msg.sender, _message, block.timestamp));

    // Randomly award a sender with .0001 rEth, with 10% odds
    uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random # generated: %s", randomNumber);
    seed = randomNumber;

    if (randomNumber < 10) {
      console.log("%s won!", msg.sender);

      uint256 prizeAmount = 0.0001 ether;
      require(
        prizeAmount <= address(this).balance,
        "Trying to withdraw more money than the contract has."
      );

      (bool success, ) = (msg.sender).call{value: prizeAmount}("");
      require(success, "Failed to withdraw money from contract.");
    }

    // Send notification for every new wave
    emit NewWave(msg.sender, block.timestamp, _message);
  }

  // Return metadata from all previous waves
  function getAllWaves() public view returns (Wave[] memory) {
    return waves;
  }

  function getTotalWaves() public view returns (uint256) {
    console.log("We have %d total waves!", totalWaves);
    return totalWaves;
  }
}
