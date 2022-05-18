import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
  return (
    <header>
      <Link href="/">
        <a>Twitt3r</a>
      </Link>
      <ConnectButton />
    </header>
  )
}
