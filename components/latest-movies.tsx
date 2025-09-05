"use client"

import { useState, useEffect } from "react"
import { MovieCard } from "@/components/movie-card"

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

export function LatestMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()
        // Filter for movies only and get 10 latest (2025)
        const movieData = data
          .filter((item: any) => item.type === "movie")
          .filter((item: any) => new Date(item.release_date).getFullYear() === 2025)
          .slice(0, 10)
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Latest 2025 Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-8">Latest 2025 Movies</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  )
}
