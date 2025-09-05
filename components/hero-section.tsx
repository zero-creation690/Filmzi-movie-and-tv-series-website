"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Download, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
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
}

export function HeroSection() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()
        // Filter for movies only and get first 7
        const movieData = data.filter((item: any) => item.type === "movie").slice(0, 7)
        setMovies(movieData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching movies:", error)
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    if (movies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [movies.length])

  if (loading) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-card to-muted animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-card to-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">No movies available</div>
        </div>
      </div>
    )
  }

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentMovie.thumbnail || "/placeholder.svg"}
          alt={currentMovie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              {currentMovie.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="bg-primary/20 text-primary">
                  {genre}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">{currentMovie.title}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-foreground font-medium">{currentMovie.rating}</span>
              </div>
              <span className="text-muted-foreground">{new Date(currentMovie.release_date).getFullYear()}</span>
              <Badge variant="outline" className="border-primary text-primary">
                {currentMovie.language}
              </Badge>
            </div>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">{currentMovie.description}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href={`/movie/${currentMovie.id}`}>
                  <Play className="w-5 h-5 mr-2" />
                  Watch Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Link href={`/movie/${currentMovie.id}`}>
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
