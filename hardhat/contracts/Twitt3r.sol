// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "hardhat/console.sol"; // DEBUG

/**
 * @title Twitt3r
 * @author Max Petretta (maxpetretta.eth)
 * @notice A decentralized version of Twitter, build on the Ethereum blockchain
 * @dev Not audited!
 */
contract Twitt3r is Ownable, Pausable {
  uint8 public odds;
  uint256 public price;
  uint256 public jackpot;
  address public lastWinner;
  uint256 private seed;
  
  struct Tweet {
    address from;
    uint256 timestamp;
    string message;
    bool deleted;
    uint256 replyID;
    uint256 retweetID;
  }

  // Mapped struct with index, see: https://ethereum.stackexchange.com/a/13168
  uint256 public id = 1; // Use id 0 for top-level tweets
  uint256[] public tweetIDs;
  mapping(uint256 => Tweet) public tweets;

  mapping(address => uint256) public lastTweetedAt;
  event NewTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message, bool deleted, uint256 replyID, uint256 retweetID);
  event EditTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message, bool deleted, uint256 replyID, uint256 retweetID);
  event DeleteTweet(uint256 indexed id, address indexed from, uint256 timestamp, string message, bool deleted, uint256 replyID, uint256 retweetID);
  event ClearTweets(uint256 id);
  event WonLottery(address winner, uint256 jackpot);

  /**
   * @notice Deploys the Twitt3r contract with the given settings
   * @param _odds The percentage (0 - 100) chance of a jackpot payout
   * @param _price The price to send a tweet
   * @param _jackpot The value of the jackpot to pay out
   */
  constructor(uint8 _odds, uint256 _price, uint256 _jackpot) payable {
    odds = _odds;
    price = _price;
    jackpot = _jackpot;
  }

  /**
   * @notice Deposit into the contract to refill for jackpot payouts
   */
  function deposit() public payable {}

  /**
   * @notice In case of emergency, the owner can withdraw from the contract
   */
  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool sent, ) = owner().call{value: amount}("");
    require(sent, "Failed to withdraw from contract");
  }

  /**
   * @notice Send a message (tweet) to the contract
   * @param _message The sender's message to post
   * @param _replyID The ID of the tweet being replied to, 0 for top-level tweets
   * @param _retweetID The ID of the tweet being resent, 0 for top-level tweets
   */
  function newTweet(string memory _message, uint256 _replyID, uint256 _retweetID) public payable whenNotPaused {
    require(msg.value >= price, "Amount sent is incorrect");
    require(bytes(_message).length <= 280, "Limit is 280 characters!");
    require(lastTweetedAt[msg.sender] + 1 minutes < block.timestamp, "Please wait a minute before tweeting again!");
    lastTweetedAt[msg.sender] = block.timestamp;

    console.log("%s has tweeted!", msg.sender); // DEBUG
    tweets[id] = Tweet(msg.sender, block.timestamp, _message, false, _replyID, _retweetID);
    tweetIDs.push(id);

    // Check if the sender has won the jackpot
    checkLottery(payable(msg.sender));

    // Alert subscribers to the new tweet transaction
    emit NewTweet(id, msg.sender, block.timestamp, _message, false, _replyID, _retweetID);
    id++;
  }

  /**
   * @notice Edit an existing tweet's message
   * @param _id The ID of the tweet being edited
   * @param _message The new replacement message for the specified tweet
   */
  function editTweet(uint256 _id, string memory _message) public whenNotPaused {
    require(tweets[_id].timestamp != 0, "Given ID is invalid");
    require(!tweets[_id].deleted, "Given tweet is deleted!");
    require(tweets[_id].from == msg.sender, "Sender does not match the given tweet");
    require(bytes(_message).length <= 280, "Limit is 280 characters!");
    tweets[_id].message = _message;

    emit EditTweet(_id, msg.sender, block.timestamp, tweets[_id].message, tweets[_id].deleted, tweets[_id].replyID, tweets[_id].retweetID);
  }

  /**
   * @notice Delete a tweet from the contract
   * @param _id The ID of the tweet to delete
   */
  function deleteTweet(uint256 _id) public whenNotPaused {
    require(tweets[_id].timestamp != 0, "Given ID is invalid");
    require(!tweets[_id].deleted, "Given tweet is already deleted!");
    require(tweets[_id].from == msg.sender, "Sender does not match the given tweet");
    tweets[_id].deleted = true;

    emit DeleteTweet(_id, msg.sender, block.timestamp, tweets[_id].message, tweets[_id].deleted, tweets[_id].replyID, tweets[_id].retweetID);
  }

  /**
   * @notice In case of emergency, the owner can clear all tweets from the contract
   */
  function clear() public onlyOwner {
    uint256 lastID = id;
    for (uint256 i = 0; i < tweetIDs.length; i++) {
      delete tweets[i];
    }
    delete tweetIDs;
    id = 1;

    emit ClearTweets(lastID);
  }

  /**
   * @notice Allow the owner to pause tweeting functions
   */
  function pause() public onlyOwner {
    _pause();
  }

  /**
   * @notice Allow the owner to unpause tweeting functions
   */
  function unpause() public onlyOwner {
    _unpause();
  }

  /**
   * @notice Allow the owner to update the contract's settings
   * @param _odds The new percentage (0 - 100) chance of a jackpot payout
   * @param _price The new price to send a tweet
   * @param _jackpot The new value of the jackpot to pay out
   */
  function updateSettings(uint8 _odds, uint256 _price, uint256 _jackpot) public onlyOwner {
    setOdds(_newOdds);
    setPrice(_newPrice);
    setJackpot(_newJackpot);
  }

  /**
   * @notice Check if the contract is paused
   * @return bool true if the contract is paused, false otherwise 
   */
  function isPaused() public view returns (bool) {
    return paused();
  }

  /**
   * @notice Get the contract owner's address
   * @return address The contract owner
   */
  function getOwner() public view returns (address) {
    return owner();
  }

  /**
   * @notice Get the balance of the contract
   * @return uint256 The current address of the contract
   */
  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  /**
   * @notice Get the odds of winning the jackpot
   * @return uint8 The current odds of a jackpot payout
   */
  function getOdds() public view returns (uint8) {
    return odds;
  }

  /**
   * @notice Get the price of sending a new tweet
   * @return uint256 The current price of sending a tweet
   */
  function getPrice() public view returns (uint256) {
    return price;
  }

  /**
   * @notice Get the jackpot payout value
   * @return uint256 The current jackpot payout amount
   */
  function getJackpot() public view returns (uint256) {
    return jackpot;
  }

  /**
   * @notice Get the last winner's address
   * @return address The last winner's wallet address
   */
  function getLastWinner() public view returns (address) {
    return lastWinner;
  }

  /**
   * @notice Get all sent tweets from the contract
   * @return Tweet[] An array of all tweets stored on the contract
   */
  function getTweets() public view returns (Tweet[] memory) {
    Tweet[] memory allTweets = new Tweet[](tweetIDs.length);
    for (uint256 i = 0; i < tweetIDs.length; i++) {
      allTweets[i] = tweets[tweetIDs[i]];
    }
    return allTweets;
  }

  /**
   * @notice Get the total number of tweets sent
   * @return uint256 The current total number of tweets
   */
  function getTotalTweets() public view returns (uint256) {
    return tweetIDs.length;
  }

  /**
   * @notice Set the odds of winning a jackpot 
   * @param _odds The new percent odds of winning
   */
  function setOdds(uint256 _odds) internal {
    odds = _odds;
  }

  /**
   * @notice Set the price of sending a tweet
   * @param _price The new price of sending a tweet
   */
  function setPrice(uint256 _price) internal {
    price = _price;
  }

  /**
   * @notice Set the jackpot payout amount
   * @param _jackpot The new value of winning a jackpot
   */
  function setJackpot(uint256 _jackpot) internal {
    jackpot = _jackpot;
  }

  /**
   * @notice Check whether the last sender won the lottery, based on the set odds
   * @dev Uses a simple RNG method based on block difficulty and timestamp, could be improved
   * @param _sender The most recent tweet sender
   */
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
