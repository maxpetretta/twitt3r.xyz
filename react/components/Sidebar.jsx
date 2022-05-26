// import Link from "next/link"
import Controls from "./Controls"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Sidebar(props) {
  return (
    <section className="flex flex-col w-1/4 border">
      <div className="self-center mt-3">
        <ConnectButton chainStatus="none" showBalance={true} />
      </div>
      <div className="flex bg-gray-200 rounded-full m-3 mt-5 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <circle cx="10" cy="10" r="7"></circle>
          <line x1="21" y1="21" x2="15" y2="15"></line>
        </svg>
        <input type="text" placeholder="Search Twitt3r" className="bg-gray-200" />
      </div>
      <div className="rounded-xl bg-gray-100 m-3 p-3">
        <h2>About Twitt3r</h2>
        <p className="mt-3">
          Twitt3r is a decentralized web3 version of Twitter built on the
          Ethereum blockchain. Connect your wallet to send, edit (!!!),
          delete, and like tw33ts!
        </p>
      </div>
      {console.log(props)}
      {props.isConnected && props.isOwner && <Controls />}
    </section>
  )
}
