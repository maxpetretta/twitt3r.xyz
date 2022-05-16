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
    address from;
    uint256 timestamp;
    string message;
    bool deleted;
  }

  // Mapped struct with index, see: https://ethereum.stackexchange.com/a/13168
  uint256 public id = 0;
  uint256[] public tweetIDs;
  mapping(uint256 => Tweet) public tweets;

  mapping(address => uint256) public lastTweetedAt;
  event NewTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message);
  event EditTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message);
  event DeleteTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message);
  event ClearTweets(uint256 id);
  event WonLottery(address winner, uint256 jackpot);

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

  // Send a message (tweet) using the contract
  function newTweet(string memory _message) public payable {
    require(!paused, "Twitt3r has been paused!");
    require(msg.value >= price, "Amount sent is incorrect");
    require(lastTweetedAt[msg.sender] + 5 minutes < block.timestamp, "Please wait 5 minutes before tweeting again!");
    lastTweetedAt[msg.sender] = block.timestamp;

    console.log("%s has tweeted!", msg.sender); // DEBUG
    tweets[id] = Tweet(msg.sender, block.timestamp, _message, false);
    tweetIDs.push(id);

    // Check if the sender has won the jackpot
    checkLottery(payable(msg.sender));

    // Alert subscribers to the new tweet transaction
    emit NewTweet(id, msg.sender, block.timestamp, _message);
    id++;
  }

  // Edit an existing tweet's message
  function editTweet(uint256 _id, string memory _message) public {
    require(!paused, "Twitt3r has been paused!");
    require(tweets[_id].timestamp != 0, "Given ID is invalid");
    require(!tweets[_id].deleted, "Given tweet is deleted!");
    require(tweets[_id].from == msg.sender, "Sender does not match the given tweet");
    tweets[_id].message = _message;

    emit EditTweet(_id, msg.sender, block.timestamp, tweets[_id].message);
  }

  // Delete a tweet from the contract
  function deleteTweet(uint256 _id) public {
    require(!paused, "Twitt3r has been paused!");
    require(tweets[_id].timestamp != 0, "Given ID is invalid");
    require(!tweets[_id].deleted, "Given tweet is already deleted!");
    require(tweets[_id].from == msg.sender, "Sender does not match the given tweet");
    tweets[_id].deleted = true;

    emit DeleteTweet(_id, msg.sender, block.timestamp, tweets[_id].message);
  }

  // Manage the contract's state
  function clear() public onlyOwner {
    uint256 lastID = id;
    for (uint256 i = 0; i < tweetIDs.length; i++) {
      delete tweets[i];
    }
    delete tweetIDs;
    id = 0;

    emit ClearTweets(lastID);
  }

  function pause(bool _value) public onlyOwner {
    paused = _value;
  }

  function updateSettings(uint256 _newPrice, uint256 _newOdds, uint256 _newJackpot) public onlyOwner {
    setPrice(_newPrice);
    setOdds(_newOdds);
    setJackpot(_newJackpot);
  }

  // Retrieve contract metadata
  function isPaused() public view returns (bool) {
    return paused;
  }

  function getOwner() public view returns (address) {
    return owner();
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
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
    Tweet[] memory allTweets = new Tweet[](tweetIDs.length);
    for (uint256 i = 0; i < tweetIDs.length; i++) {
      allTweets[i] = tweets[tweetIDs[i]];
    }
    return allTweets;
  }

  function getTotalTweets() public view returns (uint256) {
    return tweetIDs.length;
  }

  function setPrice(uint256 _newPrice) internal {
    price = _newPrice;
  }

  function setOdds(uint256 _newOdds) internal {
    odds = _newOdds;
  }

  function setJackpot(uint256 _newJackpot) internal {
    jackpot = _newJackpot;
  }

  // Randomly award a sender with the jackpot, at the set odds
  function checkLottery(address payable _sender) private {
    require(address(this).balance >= jackpot, "Contract balance is insufficient!");
    uint256 randomNumber = (block.difficulty + block.timestamp + seed) % 100;
    console.log("Random # generated: %s", randomNumber); // DEBUG
    seed = randomNumber;

    if (randomNumber < odds) {
      console.log("%s has won!", msg.sender); // DEBUG

      (bool sent, ) = _sender.call{value: jackpot}("");
      require(sent, "Failed to withdraw from contract");
      emit WonLottery(_sender, jackpot);
    }
  }
}
