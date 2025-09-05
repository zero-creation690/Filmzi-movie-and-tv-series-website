"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { TVSeriesCard } from "@/components/tv-series-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaItem {
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

interface GenreContentProps {
  genre: string
}

export function GenreContent({ genre }: GenreContentProps) {
  const [content, setContent] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        const filtered = data.filter((item: any) =>
          item.genres.some((g: string) => g.toLowerCase() === genre.toLowerCase()),
        )

        setContent(filtered)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching content:", error)
        setLoading(false)
      }
    }

    fetchContent()
  }, [genre])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const movies = content.filter((item) => item.type === "movie")
  const tvSeries = content.filter((item) => item.type === "tv")

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/genres">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Genres
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{genre}</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-primary text-primary">
              {content.length} Total Results
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
        </div>

        {content.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No content found for this genre.</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All ({content.length})
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
                {content.map((item) =>
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
                  <p className="text-muted-foreground">No movies found in this genre.</p>
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
                  <p className="text-muted-foreground">No TV series found in this genre.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
