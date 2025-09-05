"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"
import { Badge } from "@/components/ui/badge"

interface Movie {
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

export function MoviesGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()
        // Filter for movies only
        const movieData = data.filter((item: any) => item.type === "movie")
        setMovies(movieData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No movies available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Badge variant="outline" className="border-primary text-primary">
          {movies.length} Movies Available
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )
}
