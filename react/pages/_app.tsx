import {
  connectorsForWallets,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
  wallet,
} from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { AppProps } from "next/app"
import Head from "next/head"
import Script from "next/script"
import { chain, configureChains, createClient, WagmiConfig } from "wagmi"
import { infuraProvider } from "wagmi/providers/infura"
import { publicProvider } from "wagmi/providers/public"
import { AppProvider } from "../components/AppProvider"
import "../styles/globals.css"

const { chains, provider } = configureChains(
  [
    chain.hardhat,
    chain.goerli,
    chain.ropsten,
    // chain.rinkeby,
    // chain.kovan,
    // chain.optimismKovan,
    // chain.optimism,
  ], // Hardhat must come first due to provider issue, see: https://github.com/tmm/wagmi/discussions/425
  [
    infuraProvider({ infuraId: process.env.REACT_APP_INFURA_ID }),
    publicProvider(),
  ]
)

const { wallets } = getDefaultWallets({
  appName: "Twitt3r.xyz",
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "More",
    wallets: [
      wallet.argent({ chains }),
      wallet.trust({ chains }),
      wallet.ledger({ chains }),
    ],
  },
])

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#4361a2"
        />
        <meta name="msapplication-TileColor" content="#c73156" />
        <meta name="theme-color" content="#111827" />
        {/* Preconnects */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#e73e83",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
          chains={chains}
          coolMode
        >
          <AppProvider>
            <Component {...pageProps} />
          </AppProvider>
        </RainbowKitProvider>
      </WagmiConfig>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script id="gtag">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
