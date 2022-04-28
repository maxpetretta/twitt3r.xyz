// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol"; // DEBUG

contract WavePortal is Ownable {
  bool public paused = false;
  uint256 public price = 0.0001 ether;
  uint256 public jackpot = 0.001 ether;
  uint256 public odds = 10;
  address public lastWinner;
  uint256 private seed;
  
  struct Wave {
    uint256 index;
    address sender;
    uint256 timestamp;
    string message;
  }

  Wave[] public waves;
  mapping(address => uint256) public lastWavedAt;
  event NewWave(uint256 index, address indexed from, uint256 timestamp, string message);

  constructor() payable {
    // wave("Hello World!");
  }


  // Manage the contract's balance
  function deposit() public payable {}

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool sent, ) = owner().call{value: amount}("");
    require(sent, "Failed to withdraw from contract");
  }

  function setPrice(uint256 newPrice) public onlyOwner {
    price = newPrice;
  }

  function setOdds(uint256 newOdds) public onlyOwner {
    odds = newOdds;
  }

  function setJackpot(uint256 newJackpot) public onlyOwner {
    jackpot = newJackpot;
  }

  function updateSettings(uint256 newPrice, uint256 newOdds, uint256 newJackpot) public onlyOwner {
    setPrice(newPrice);
    setOdds(newOdds);
    setJackpot(newJackpot);
  }


  // Manage the contract's state
  function clear() public onlyOwner {
    delete waves;
  }

  function pause(bool value) public onlyOwner {
    paused = value;
  }


  // Send a message (wave) using the contract
  function wave(string memory message) public payable {
    require(!paused, "The wave portal has been paused!");
    require(msg.value >= price, "Amount sent is incorrect");
    require(lastWavedAt[msg.sender] + 5 minutes < block.timestamp, "Please wait 5 minutes before waving again!");
    lastWavedAt[msg.sender] = block.timestamp;

    console.log("%s has waved!", msg.sender); // DEBUG
    waves.push(Wave(waves.length, msg.sender, block.timestamp, message));

    // Check if the sender has won the jackpot
    checkLottery(payable(msg.sender));

    // Alert subscribers to the new wave transaction
    emit NewWave(waves.length - 1, msg.sender, block.timestamp, message);
  }

  // Randomly award a sender with the jackpot, at the set odds
  function checkLottery(address payable sender) private {
    require(address(this).balance >= jackpot, "Contract balance is insufficient");
    uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random # generated: %s", randomNumber); // DEBUG
    seed = randomNumber;

    if (randomNumber < odds) {
      console.log("%s has won!", msg.sender); // DEBUG

      (bool sent, ) = sender.call{value: jackpot}("");
      require(sent, "Failed to withdraw from contract");
    }
  }

  // Delete a wave from the contract
  function deleteWave(uint256 index) public {
    require(waves.length > index, "Given index is invalid");
    require(waves[index].sender == msg.sender, "Sender does not match the given wave");
    waves[index] = waves[waves.length - 1];
    waves.pop();
  }


  // Retrieve contract metadata
  function getOwner() public view returns (address) {
    return owner();
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function isPaused() public view returns (bool) {
    return paused;
  }

  function getPrice() public view returns (uint256) {
    return price;
  }

  function getOdds() public view returns (uint256) {
    return odds;
  }

  function getJackpot() public view returns (uint256) {
    return jackpot;
  }
  
  function getLastWinner() public view returns (address) {
    return lastWinner;
  }

  function getAllWaves() public view returns (Wave[] memory) {
    return waves;
  }

  function getTotalWaves() public view returns (uint256) {
    return waves.length;
  }
}
