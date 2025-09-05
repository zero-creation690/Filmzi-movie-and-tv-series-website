import Link from "next/link"
import Image from "next/image"
import { Film, Tv, Globe, Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    browse: [
      { href: "/", label: "Home" },
      { href: "/movies", label: "Movies" },
      { href: "/tv-series", label: "TV Series" },
      { href: "/anime", label: "Anime" },
    ],
    categories: [
      { href: "/genres", label: "Genres" },
      { href: "/languages", label: "Languages" },
      { href: "/search", label: "Search" },
    ],
  }

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="https://ar-hosting.pages.dev/1756681512254.jpg"
                alt="Filmzi Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-foreground">Filmzi</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Your ultimate destination for streaming and downloading the latest movies and TV series in high quality.
              Discover entertainment from around the world.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                <Film className="w-3 h-3" />
                <span>Movies</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                <Tv className="w-3 h-3" />
                <span>TV Series</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                <Globe className="w-3 h-3" />
                <span>Multi-Language</span>
              </div>
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Browse</h3>
            <ul className="space-y-2">
              {footerLinks.browse.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">All rights reserved ©{currentYear} Filmzi</p>
              <p className="text-muted-foreground text-xs mt-1">
                Our website does not host or store any movie or any link. All content is provided by third-party
                sources.
              </p>
            </div>

            {/* Made with Love */}
            <div className="flex items-center space-x-1 text-muted-foreground text-xs">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for movie lovers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
