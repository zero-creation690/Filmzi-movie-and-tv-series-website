"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GenreData {
  name: string
  count: number
  image: string
}

export function GenreGrid() {
  const [genres, setGenres] = useState<GenreData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        // Extract and count genres
        const genreCount: { [key: string]: number } = {}
        data.forEach((item: any) => {
          item.genres.forEach((genre: string) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1
          })
        })

        // Convert to array and sort by count
        const genreArray = Object.entries(genreCount)
          .map(([name, count]) => ({
            name,
            count,
            image: `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(name + " genre")}`,
          }))
          .sort((a, b) => b.count - a.count)

        setGenres(genreArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching genres:", error)
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="aspect-[3/2] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {genres.map((genre) => (
        <Link key={genre.name} href={`/genres/${encodeURIComponent(genre.name)}`}>
          <Card className="group bg-card border-border hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[3/2] relative overflow-hidden">
                <div
                  className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${genre.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="relative z-10 text-center p-4">
                    <h3 className="text-xl font-bold text-white mb-2">{genre.name}</h3>
                    <Badge className="bg-primary/90 text-primary-foreground">
                      {genre.count} {genre.count === 1 ? "Title" : "Titles"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
