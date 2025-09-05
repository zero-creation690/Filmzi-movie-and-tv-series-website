// src/components/WatchPlayer.tsx
"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import PlyrVideoPlayer from "./PlyrVideoPlayer" // Import the new player component

interface Movie {
  id: number
  title: string
  thumbnail: string
  release_date: string
  language: string
  video_links: {
    video_720p?: string
    video_1080p?: string
    video_2160p?: string
  }
}

interface Episode {
  episode_number: number
  episode_name: string
  video_720p?: string
  video_1080p?: string
}

interface Season {
  season_number: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  title: string
  thumbnail: string
  release_date: string
  language: string
  seasons: { [key: string]: Season }
}

interface WatchPlayerProps {
  movieId: string
  preferredQuality?: string
  episode?: string
  season?: string
}

export function WatchPlayer({ movieId, preferredQuality, episode, season }: WatchPlayerProps) {
  const [media, setMedia] = useState<Movie | TVSeries | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoSources, setVideoSources] = useState<any[]>([])

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true)
        console.log("[v1] Fetching media data for ID:", movieId)
        const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`, {
          priority: "high",
          cache: "force-cache",
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const data = await response.json()
        setMedia(data)

        let sources = []
        let mediaItem
        
        if (data.type === "tv" && episode && season) {
          const seasonData = data.seasons?.[`season_${season}`]
          mediaItem = seasonData?.episodes?.find((ep: Episode) => ep.episode_number === Number.parseInt(episode))
        } else {
          mediaItem = data
        }

        if (mediaItem?.video_links) {
          // For Movies
          if (mediaItem.video_links.video_2160p) sources.push({ src: mediaItem.video_links.video_2160p, type: "video/mp4", size: 2160 })
          if (mediaItem.video_links.video_1080p) sources.push({ src: mediaItem.video_links.video_1080p, type: "video/mp4", size: 1080 })
          if (mediaItem.video_links.video_720p) sources.push({ src: mediaItem.video_links.video_720p, type: "video/mp4", size: 720 })
        } else if (mediaItem?.video_720p || mediaItem?.video_1080p) {
          // For TV series episodes
          if (mediaItem.video_1080p) sources.push({ src: mediaItem.video_1080p, type: "video/mp4", size: 1080 })
          if (mediaItem.video_720p) sources.push({ src: mediaItem.video_720p, type: "video/mp4", size: 720 })
        }

        setVideoSources(sources)
        console.log("[v1] Media sources prepared:", sources)

      } catch (error) {
        console.error("[v1] Error fetching media:", error)
        setMedia(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [movieId, episode, season])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl animate-pulse">Loading Filmzi Player...</div>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Content not found</div>
      </div>
    )
  }

  const isTvSeries = "seasons" in media
  const mediaItem = isTvSeries
    ? media.seasons?.[`season_${season}`]?.episodes?.find(ep => ep.episode_number === Number.parseInt(episode || ""))
    : media
  
  if (isTvSeries && !mediaItem) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Episode not found</div>
      </div>
    )
  }

  let mediaTitle = isTvSeries
    ? `${media.title} - S${season}E${episode}: ${mediaItem?.episode_name}`
    : media.title
  let mediaYear = new Date(media.release_date).getFullYear().toString()
  let mediaLanguage = media.language
  let mediaThumbnail = media.thumbnail
  let backLink = isTvSeries ? `/tv-series/${movieId}` : `/movie/${movieId}`

  return (
    <div className="w-full min-h-screen bg-black">
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href={backLink}>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-600/20 border border-red-600/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Details</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-white text-lg sm:text-2xl font-bold tracking-wide line-clamp-1">{mediaTitle}</h1>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
                <span className="text-red-400 text-xs sm:text-sm font-medium">{mediaYear}</span>
                <span className="text-white/60 hidden sm:inline">•</span>
                <span className="text-white/80 text-xs sm:text-sm uppercase tracking-wider hidden sm:inline">
                  {mediaLanguage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-full aspect-video max-w-5xl mx-auto">
          <PlyrVideoPlayer
            sources={videoSources}
            poster={mediaThumbnail}
          />
        </div>
      </div>
    </div>
  )
}
