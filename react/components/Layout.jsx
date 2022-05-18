import Head from "next/head"
import Header from "./Header"
import Footer from "./Footer"
import { useRouter } from "next/router"

export default function Layout(props) {
  const { children, ...pageMeta } = props
  const router = useRouter()
  const meta = {
    title: "Twitt3r - What's happening (in web3)",
    description:
      "Twitter, but make it web3.  A decentralized Twitter clone built on the Ethereum blockchain.",
    image: "https://twitt3r.xyz/images/twitter.png",
    type: "website",
    ...pageMeta,
  }

  return (
    <>
      <Head>
        {/* Dynamic SEO meta tags */}
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        <link
          rel="canonical"
          href={`https://twitt3r.xyz${router.asPath}`}
        />
        <meta
          property="og:url"
          content={`https://twitt3r.xyz${router.asPath}`}
        />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.image} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content="Twitt3r" />
        <meta name="twitter:site" content="@maxpetretta" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Head>
      <Header />
        <main>
          {children}
        </main>
      <Footer />
    </>
  )
}
