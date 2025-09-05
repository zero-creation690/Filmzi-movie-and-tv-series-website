"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search movies, TV series, anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20 h-12 text-base bg-card border-border focus:border-red-600 focus:ring-red-600/20"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 px-4"
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}
