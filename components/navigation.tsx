"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SearchDropdown } from "@/components/search-dropdown"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/tv-series", label: "TV Series" },
    { href: "/genres", label: "Genres" },
    { href: "/languages", label: "Languages" },
    { href: "/anime", label: "Anime" },
  ]

  useEffect(() => {
    const searchMedia = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowSearchDropdown(false)
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        const filtered = data
          .filter(
            (item: any) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.genres.some((genre: string) => genre.toLowerCase().includes(searchQuery.toLowerCase())),
          )
          .slice(0, 6) // Limit to 6 results for dropdown

        setSearchResults(filtered)
        setShowSearchDropdown(true)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchMedia, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchDropdown(false)
      setIsMenuOpen(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://ar-hosting.pages.dev/1756681512254.jpg"
              alt="Filmzi Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">Filmzi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV series..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-10 w-64 bg-input border-border"
                    onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                  />
                </div>
              </form>

              {/* Search Dropdown */}
              {showSearchDropdown && (
                <SearchDropdown
                  results={searchResults}
                  isLoading={isSearching}
                  query={searchQuery}
                  onClose={() => setShowSearchDropdown(false)}
                />
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search movies, TV series..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
