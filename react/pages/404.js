import Head from "next/head"
import Link from "next/link"

export default function Error404() {
  return (
    <>
      <Head>
        <title>Error 404 - Twitt3r</title>
        <meta name="description" content="That page cannot be found!" />
      </Head>
      <section>
        <h1>404: Rugged again!</h1>
        <h2>Looks like that page no longer exists</h2>
        <p>
          Or it could have never existed in the first place.{"  "}Come to think
          of it, maybe none of this actually exists?{"  "}This could all be a
          really complex computer simulation, or something... 🤔
        </p>
        <p>
          Weird.{"  "}Anyways, if you are looking for another way to pass your
          simulation cycles, why not{" "}
          <Link href="/">
            <a>return home?</a>
          </Link>
        </p>
      </section>
    </>
  )
}
