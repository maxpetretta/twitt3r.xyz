const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});


// //SPDX-License-Identifier: Unlicense
// pragma solidity ^0.8.0;

// import "hardhat/console.sol";

// contract Greeter {
//     string private greeting;

//     constructor(string memory _greeting) {
//         console.log("Deploying a Greeter with greeting:", _greeting);
//         greeting = _greeting;
//     }

//     function greet() public view returns (string memory) {
//         return greeting;
//     }

//     function setGreeting(string memory _greeting) public {
//         console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
//         greeting = _greeting;
//     }
// }