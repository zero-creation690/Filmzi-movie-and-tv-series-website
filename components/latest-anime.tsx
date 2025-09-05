"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "./movie-card"
import { TVSeriesCard } from "./tv-series-card" // Import TVSeriesCard component

interface Anime {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  type: string
}

export function LatestAnime() {
  const [anime, setAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        // Filter for anime content (Animation genre and recent releases)
        const animeContent = data
          .filter(
            (item: any) =>
              item.genres?.some(
                (genre: string) => genre.toLowerCase().includes("animation") || genre.toLowerCase().includes("anime"),
              ) && new Date(item.release_date).getFullYear() >= 2024,
          )
          .slice(0, 10)

        setAnime(animeContent)
      } catch (error) {
        console.error("Error fetching anime:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Latest Anime</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Latest Anime</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {anime.map((item) =>
            item.type === "tv" ? (
              <TVSeriesCard key={item.id} tvSeries={item} />
            ) : (
              <MovieCard key={item.id} movie={item} />
            ),
          )}
        </div>
      </div>
    </section>
  )
}
