"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tv, Film, Loader2 } from "lucide-react"

interface SearchResult {
  id: number
  title: string
  type: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
}

interface SearchDropdownProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  onClose: () => void
}

export function SearchDropdown({ results, isLoading, query, onClose }: SearchDropdownProps) {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Searching...</span>
        </div>
      </div>
    )
  }

  if (results.length === 0 && query.length >= 2) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
        <p className="text-muted-foreground text-sm text-center">No results found for "{query}"</p>
      </div>
    )
  }

  if (results.length === 0) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        {results.map((item) => (
          <Link
            key={item.id}
            href={item.type === "movie" ? `/movie/${item.id}` : `/tv-series/${item.id}`}
            onClick={onClose}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200"
          >
            <div className="relative w-12 h-16 flex-shrink-0">
              <Image
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover rounded"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-foreground text-sm truncate">{item.title}</h4>
                {item.type === "tv" ? (
                  <Tv className="w-3 h-3 text-primary flex-shrink-0" />
                ) : (
                  <Film className="w-3 h-3 text-primary flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-muted-foreground">{new Date(item.release_date).getFullYear()}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">★ {item.rating}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {item.genres.slice(0, 2).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs bg-primary/20 text-primary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}

        {results.length > 0 && (
          <div className="border-t border-border mt-2 pt-2">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="block w-full text-center py-2 text-sm text-primary hover:text-primary/80 transition-colors duration-200"
            >
              View all results for "{query}"
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
