import "../styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"
import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import { chain, createClient, WagmiProvider } from "wagmi"

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby, chain.hardhat],
  [apiProvider.infura(process.env.REACT_APP_INFURA_ID), apiProvider.fallback()]
)
const { connectors } = getDefaultWallets({
  appName: "Twitt3r.xyz",
  chains,
})
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains} coolMode>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiProvider>
  )
}
