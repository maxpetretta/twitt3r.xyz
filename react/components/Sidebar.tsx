import { ConnectButton } from "@rainbow-me/rainbowkit"
import Controls from "./Controls"

export default function Sidebar(props: { isOwner: boolean }) {
  return (
    <aside className="hidden min-h-screen w-1/4 flex-col lg:flex">
      <div className="mt-3 self-center">
        <ConnectButton chainStatus="none" showBalance={true} />
      </div>
      <div className="m-3 mt-5 flex rounded-full bg-gray-200 p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <circle cx="10" cy="10" r="7"></circle>
          <line x1="21" y1="21" x2="15" y2="15"></line>
        </svg>
        <input
          type="text"
          placeholder="Search Twitt3r"
          className="ml-3 bg-gray-200 outline-none"
        />
      </div>
      <div className="m-3 rounded-xl bg-gray-100 p-3">
        <h2>About Twitt3r</h2>
        <p className="mt-3">
          Twitt3r is a decentralized web3 version of Twitter built on the
          Ethereum blockchain. Connect your wallet to send, edit (!!!), delete,
          and like tw33ts!
        </p>
      </div>
      {!props.isOwner && (
        <div className="m-3 rounded-xl bg-gray-100 p-3">
          <h3>Contract Settings</h3>
          <p className="mt-1">
            Connect as the owner wallet to modify contract settings...
          </p>
        </div>
      )}
      {props.isOwner && <Controls />}
      <div className="mt-auto mb-12 flex flex-col items-center text-center">
        <span>
          Disclaimer: Not actually associated with{" "}
          <a href="https://twitter.com">Twitter, Inc.</a> in any way
        </span>
      </div>
    </aside>
  )
}
