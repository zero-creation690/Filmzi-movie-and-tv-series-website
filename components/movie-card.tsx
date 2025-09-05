"use client"

import type React from "react"

import Image from "next/image"
import { Star, Play, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"

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

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/movie/${movie.id}`)
  }

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/watch/${movie.id}`)
  }

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Add download logic here
  }

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <Image
          src={movie.thumbnail || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute top-2 right-2">
          <Badge className="bg-red-600/90 text-white border-none font-semibold text-xs sm:text-sm">
            <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
            {movie.rating}
          </Badge>
        </div>

        <div className="absolute top-2 left-2">
          <Badge className="bg-black/70 text-white border-none text-xs">{movie.language}</Badge>
        </div>

        {/* Hover Content */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <h3 className="text-white font-semibold text-xs sm:text-sm mb-2 line-clamp-2">{movie.title}</h3>

          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-xs">{new Date(movie.release_date).getFullYear()}</span>
            <div className="flex gap-1">
              {movie.genres?.slice(0, 2).map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-red-600/20 text-red-400">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-xs" onClick={handleWatchClick}>
              <Play className="w-3 h-3 mr-1" />
              Watch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 text-xs bg-transparent"
              onClick={handleDownloadClick}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
