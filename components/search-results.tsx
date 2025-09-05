"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { TVSeriesCard } from "@/components/tv-series-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface SearchItem {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  type: string
  total_seasons?: number
}

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const searchMedia = async () => {
      if (!query.trim()) {
        setResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        const filtered = data.filter(
          (item: any) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.genres.some((genre: string) => genre.toLowerCase().includes(query.toLowerCase())) ||
            item.language.toLowerCase().includes(query.toLowerCase()),
        )

        setResults(filtered)
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    searchMedia()
  }, [query])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">Enter a search term to find movies and TV series.</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg mb-4">No results found for "{query}"</p>
        <p className="text-muted-foreground">Try searching with different keywords or check your spelling.</p>
      </div>
    )
  }

  const movies = results.filter((item) => item.type === "movie")
  const tvSeries = results.filter((item) => item.type === "tv")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="border-primary text-primary">
          {results.length} Total Results
        </Badge>
        {movies.length > 0 && (
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {movies.length} Movies
          </Badge>
        )}
        {tvSeries.length > 0 && (
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {tvSeries.length} TV Series
          </Badge>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All ({results.length})
          </TabsTrigger>
          <TabsTrigger
            value="movies"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Movies ({movies.length})
          </TabsTrigger>
          <TabsTrigger
            value="tv"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            TV Series ({tvSeries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {results.map((item) =>
              item.type === "movie" ? (
                <MovieCard key={item.id} movie={item} />
              ) : (
                <TVSeriesCard key={item.id} tvSeries={item} />
              ),
            )}
          </div>
        </TabsContent>

        <TabsContent value="movies" className="mt-6">
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No movies found for "{query}"</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tv" className="mt-6">
          {tvSeries.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {tvSeries.map((series) => (
                <TVSeriesCard key={series.id} tvSeries={series} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No TV series found for "{query}"</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
