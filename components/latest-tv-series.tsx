"use client"

import { useState, useEffect } from "react"
import { TVSeriesCard } from "./tv-series-card"

interface TVSeries {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  type: string
  total_seasons: number
}

export function LatestTvSeries() {
  const [tvSeries, setTvSeries] = useState<TVSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestTvSeries = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        const latestTvSeries = data
          .filter((item: any) => item.type === "tv-series" && new Date(item.release_date).getFullYear() === 2025)
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt || b.release_date).getTime() - new Date(a.createdAt || a.release_date).getTime(),
          )
          .slice(0, 10)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail: item.poster || item.thumbnail,
            rating: item.rating?.toString() || "0.0",
            release_date: item.release_date,
            genres: item.genres || [],
            language: item.language,
            type: item.type,
            total_seasons: item.seasons?.length || item.total_seasons || 1,
          }))

        setTvSeries(latestTvSeries)
      } catch (error) {
        console.error("Error fetching TV series:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestTvSeries()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">Latest TV Series</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[2/3] mb-3"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-balance">Latest TV Series</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {tvSeries.map((series) => (
            <TVSeriesCard key={series.id} tvSeries={series} />
          ))}
        </div>
      </div>
    </section>
  )
}
