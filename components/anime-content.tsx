"use client"

import { useState, useEffect } from "react"
import { TVSeriesCard } from "@/components/tv-series-card"
import { Badge } from "@/components/ui/badge"

interface AnimeItem {
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

export function AnimeContent() {
  const [anime, setAnime] = useState<AnimeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        // Filter for anime content (Animation genre and Japanese language)
        const filtered = data.filter(
          (item: any) =>
            item.genres.includes("Animation") ||
            item.language.toLowerCase() === "japanese" ||
            item.language.toLowerCase() === "ja",
        )

        setAnime(filtered)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching anime:", error)
        setLoading(false)
      }
    }

    fetchAnime()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (anime.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No anime content available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="border-primary text-primary">
          {anime.length} Anime {anime.length === 1 ? "Series" : "Series"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {anime.map((item) => (
          <TVSeriesCard key={item.id} tvSeries={item} />
        ))}
      </div>
    </div>
  )
}
