"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Play, Download, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

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

interface TVSeriesCardProps {
  tvSeries: TVSeries
}

export function TVSeriesCard({ tvSeries }: TVSeriesCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/tv-series/${tvSeries.id}`}>
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={tvSeries.thumbnail || "/placeholder.svg"}
            alt={tvSeries.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Rating Badge */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/70 text-white border-none">
              <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
              {tvSeries.rating}
            </Badge>
          </div>

          {/* TV Series Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary/90 text-primary-foreground border-none">
              <Tv className="w-3 h-3 mr-1" />
              TV
            </Badge>
          </div>

          {/* Hover Content */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{tvSeries.title}</h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-xs">{new Date(tvSeries.release_date).getFullYear()}</span>
              <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                {tvSeries.total_seasons} Season{tvSeries.total_seasons !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-xs">
                <Play className="w-3 h-3 mr-1" />
                Watch
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10 text-xs bg-transparent"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
