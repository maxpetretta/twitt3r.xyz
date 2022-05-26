import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
  return (
    <header className="sticky top-0 flex justify-between items-center p-4 bg-white">
      <Link href="/">
        <a className="no-link text-2xl font-bold" aria-label="A link to the homepage">Twitt3r</a>
      </Link>
      <ConnectButton />
    </header>
  )
}
