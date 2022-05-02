// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol"; // DEBUG

contract Twitt3r is Ownable {
  bool public paused = false;
  uint256 public price = 0.0001 ether;
  uint256 public jackpot = 0.001 ether;
  uint256 public odds = 10;
  address public lastWinner;
  uint256 private seed;
  
  struct Tweet {
    uint256 index;
    address sender;
    uint256 timestamp;
    string message;
  }

  Tweet[] public tweets;
  mapping(address => uint256) public lastTweetdAt;
  event NewTweet(uint256 index, address indexed from, uint256 timestamp, string message);

  constructor() payable {
    // tweet("Hello World!");
  }


  // Manage the contract's balance
  function deposit() public payable {}

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool sent, ) = owner().call{value: amount}("");
    require(sent, "Failed to withdraw from contract");
  }

  function setPrice(uint256 newPrice) internal {
    price = newPrice;
  }

  function setOdds(uint256 newOdds) internal {
    odds = newOdds;
  }

  function setJackpot(uint256 newJackpot) internal {
    jackpot = newJackpot;
  }

  function updateSettings(uint256 newPrice, uint256 newOdds, uint256 newJackpot) public onlyOwner {
    setPrice(newPrice);
    setOdds(newOdds);
    setJackpot(newJackpot);
  }


  // Manage the contract's state
  function clear() public onlyOwner {
    delete tweets;
  }

  function pause(bool value) public onlyOwner {
    paused = value;
  }


  // Send a message (tweet) using the contract
  function tweet(string memory message) public payable {
    require(!paused, "The tweet portal has been paused!");
    require(msg.value >= price, "Amount sent is incorrect");
    require(lastTweetdAt[msg.sender] + 5 minutes < block.timestamp, "Please wait 5 minutes before waving again!");
    lastTweetdAt[msg.sender] = block.timestamp;

    console.log("%s has tweetd!", msg.sender); // DEBUG
    tweets.push(Tweet(tweets.length, msg.sender, block.timestamp, message));

    // Check if the sender has won the jackpot
    checkLottery(payable(msg.sender));

    // Alert subscribers to the new tweet transaction
    emit NewTweet(tweets.length - 1, msg.sender, block.timestamp, message);
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

  // Delete a tweet from the contract
  function deleteTweet(uint256 index) public {
    require(tweets.length > index, "Given index is invalid");
    require(tweets[index].sender == msg.sender, "Sender does not match the given tweet");
    tweets[index] = tweets[tweets.length - 1];
    tweets.pop();
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

  function getTweets() public view returns (Tweet[] memory) {
    return tweets;
  }

  function getTotalTweets() public view returns (uint256) {
    return tweets.length;
  }
}
