"use client"

import { useState, useEffect } from "react"
import { TVSeriesCard } from "@/components/tv-series-card"

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

export function TVSeriesGrid() {
  const [tvSeries, setTVSeries] = useState<TVSeries[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTVSeries = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()
        // Filter for TV series only and get 10 latest (2025)
        const tvData = data
          .filter((item: any) => item.type === "tv")
          .filter((item: any) => new Date(item.release_date).getFullYear() === 2025)
          .slice(0, 10)
        setTVSeries(tvData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching TV series:", error)
        setLoading(false)
      }
    }

    fetchTVSeries()
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

  if (tvSeries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No TV series available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {tvSeries.map((series) => (
        <TVSeriesCard key={series.id} tvSeries={series} />
      ))}
    </div>
  )
}
