import Head from "next/head"
// import Script from "next/script"
import { ThemeProvider } from "next-themes"
import { chain, createClient, WagmiProvider } from "wagmi"
import {
  // darkTheme,
  lightTheme,
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import "../styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"

const { chains, provider } = configureChains(
  [chain.hardhat, chain.mainnet, chain.rinkeby], // Hardhat must come first due to provider issue, see: https://github.com/tmm/wagmi/discussions/425
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
      <ThemeProvider attribute="class" forcedTheme="light">
        <WagmiProvider client={wagmiClient}>
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
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiProvider>
      </ThemeProvider>
      {/* <Script
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
      </Script> */}
    </>
  )
}
