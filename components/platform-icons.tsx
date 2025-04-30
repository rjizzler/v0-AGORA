import Image from "next/image"

interface PlatformIconProps {
  href: string
  iconSrc: string
  alt: string
  className?: string
}

export function PlatformIcon({ href, iconSrc, alt, className = "" }: PlatformIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors ${className}`}
      title={alt}
    >
      <div className="relative w-5 h-5">
        <Image src={iconSrc || "/placeholder.svg"} alt={alt} fill className="object-contain" />
      </div>
    </a>
  )
}

export function PumpIcon({ address, className }: { address: string; className?: string }) {
  return (
    <PlatformIcon
      href={`https://pump.fun/coin/${address}`}
      iconSrc="/icons/pump-pill-icon.webp"
      alt="View on pump.fun"
      className={className}
    />
  )
}

export function PhotonIcon({ address, className }: { address: string; className?: string }) {
  return (
    <PlatformIcon
      href={`https://photon-sol.tinyastro.io/en/lp/${address}`}
      iconSrc="/icons/photon-flower-icon.webp"
      alt="View on Photon"
      className={className}
    />
  )
}

export function AxiomIcon({ address, className }: { address: string; className?: string }) {
  return (
    <PlatformIcon
      href={`https://axiom.trade/meme/${address}`}
      iconSrc="/icons/axiom-triangle-icon.png"
      alt="View on Axiom"
      className={className}
    />
  )
}

export function DexscreenerIcon({ address, className }: { address: string; className?: string }) {
  return (
    <PlatformIcon
      href={`https://dexscreener.com/solana/${address}`}
      iconSrc="/icons/dexscreener-eagle-icon.webp"
      alt="View on Dexscreener"
      className={className}
    />
  )
}
