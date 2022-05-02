import Link from "next/link"

export default function Header(props) {
  /**
   * Connect to a wallet using web3Modal
   */
  const connectWallet = async () => {
    try {
      await props.web3Modal.connect()
      props.checkConnectedWallet()
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Disconnect from the user's wallet, and clear the cached provider
   */
  const disconnectWallet = async () => {
    try {
      props.web3Modal.clearCachedProvider()
      props.setAccount(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header>
      <Link href="/">
        <a>Twitt3r</a>
      </Link>
      {!props.account && <button onClick={connectWallet}>Connect Wallet</button>}
      {props.account && <button onClick={disconnectWallet}>Disconnect Wallet</button>}
    </header>
  )
}
