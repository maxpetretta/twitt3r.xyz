import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveMessage, setWaveMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const [price, setPrice] = useState(0);
  const [odds, setOdds] = useState(0);
  const [jackpot, setJackpot] = useState(0);

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
        console.log(allWaves);

        /*
        * Check if this wallet belongs to the owner
        */
        const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

        const owner = await wavePortalContract.getOwner();

        if (owner.toUpperCase() === accounts[0].toUpperCase()) {
          setIsOwner(true);
          getPrice();
          getOdds();
          getJackpot();
        }        
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Connect to the user's wallet
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"  });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const {ethereum } = window;
      if (ethereum ) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            index: wave.index,
            address: wave.sender,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (index, from, timestamp, message) => {
          console.log("NewWave", index, from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            index: index,
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(waveMessage, {value: ethers.utils.parseUnits("0.0001"), gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const clearAllWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const clearTxn = await wavePortalContract.clear({gasLimit: 300000 });
        console.log("Clearing...", clearTxn.hash);

        await clearTxn.wait();
        console.log("Cleared -- ", clearTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const pauseContract = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let check = await wavePortalContract.isPaused();
        console.log("Checked contract status, pause = ", check.toString());

        if (check) {
          const pauseTxn = await wavePortalContract.pause(false, {gasLimit: 300000});
          console.log("Unpausing...", pauseTxn.hash);

          await pauseTxn.wait();
          console.log("Unpaused -- ", pauseTxn.hash);  
        } else {
          const pauseTxn = await wavePortalContract.pause(true, {gasLimit: 300000});
          console.log("Pausing...", pauseTxn.hash);

          await pauseTxn.wait();
          console.log("Paused -- ", pauseTxn.hash);
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getPrice = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

        const price = await wavePortalContract.getPrice();
        setPrice(ethers.utils.formatEther(price))
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getOdds = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

        const odds = await wavePortalContract.getOdds();
        setOdds(ethers.utils.formatUnits(odds, 0));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getJackpot = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, provider);

        const jackpot = await wavePortalContract.getJackpot();
        setJackpot(ethers.utils.formatEther(jackpot));
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const deleteWave = async (index) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const deleteTxn = await wavePortalContract.deleteWave(index, {gasLimit: 300000 });
        console.log("Deleting...", deleteTxn.hash);

        await deleteTxn.wait();
        console.log("Deleted -- ", deleteTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const updateSettings = async (event) => {
    try {
      event.preventDefault();
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        console.log(event.target.odds.value);

        const updateTxn = await wavePortalContract.updateSettings(ethers.utils.parseEther(event.target.price.value), event.target.odds.value, ethers.utils.parseEther(event.target.jackpot.value), {gasLimit: 300000 });
        console.log("Updating...", updateTxn.hash);

        await updateTxn.wait();
        console.log("Updated settings -- ", updateTxn.hash);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * On page load, check for an existing wallet
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  /*
  * Main page content
  */
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          My name is Max, and I'm learning about web3 with <a href="https://buildspace.so">Buildspace</a>.
          Connect your Ethereum wallet to wave at me!
        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <input type="text" id="messageBox" className="messageBox" placeholder="Type your message here..." value={waveMessage} onChange={e => setWaveMessage(e.target.value)}/>
        )}

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {isOwner && (
          <div className="message">
            <h3>Owner Settings</h3>
            <form onSubmit={updateSettings}>
              <div className="ownerForm">
                <div className="ownerSettings">
                  <label>Wave Price: {price}Ξ</label>
                  <input type="number" id="price" className="textBox" placeholder="Price in Ether" required />
                  <label>Lottery Odds: {odds}%</label>
                  <input type="number" id="odds" className="textBox" placeholder="Odds 0 - 100%" required />
                  <label>Lottery Jackpot: {jackpot}Ξ</label>
                  <input type="number" id="jackpot" className="textBox" placeholder="Prize in Ether" required />
                </div>
                <div className="ownerButtons">
                  <button className="waveButton" type="button" onClick={clearAllWaves}>Clear All Waves</button>
                  <button className="waveButton" type="button" onClick={pauseContract}>Pause Contract</button>
                  <button className="waveButton" type="submit">Submit Changes</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="message">
              <button onClick={() => deleteWave(wave.index)} className="deleteButton">✕</button>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App
