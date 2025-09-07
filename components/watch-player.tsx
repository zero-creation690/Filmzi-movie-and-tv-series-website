"use client"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlyrInstance {
  source: any
  quality: number
  destroy: () => void
  play: () => Promise<void>
  pause: () => void
  on: (event: string, callback: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    Plyr: any
  }
}

interface Movie {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  video_links: {
    video_720p?: string
    video_1080p?: string
    video_2160p?: string
  }
  download_links: {
    download_720p?: { url: string; file_type: string }
    download_1080p?: { url: string; file_type: string }
    download_2160p?: { url: string; file_type: string }
  }
}

interface Episode {
  episode_number: number
  episode_name: string
  video_720p?: string
  video_1080p?: string
  download_720p?: { url: string; file_type: string }
  download_1080p?: { url: string; file_type: string }
}

interface Season {
  season_number: number
  total_episodes: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  total_seasons: number
  seasons: {
    [key: string]: Season
  }
}

interface WatchPlayerProps {
  movieId: string
  preferredQuality?: string
  episode?: string
  season?: string
}

// ✅ Helper to detect MIME type from extension
const getMimeType = (url: string): string => {
  const ext = url.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "mp4":
      return "video/mp4"
    case "webm":
      return "video/webm"
    case "ogg":
    case "ogv":
      return "video/ogg"
    case "mkv":
      return "video/x-matroska"
    default:
      return "video/mp4"
  }
}

export function WatchPlayer({ movieId, preferredQuality, episode, season }: WatchPlayerProps) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [tvSeries, setTvSeries] = useState<TVSeries | null>(null)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuality, setCurrentQuality] = useState<string>("")
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const [plyrInstance, setPlyrInstance] = useState<PlyrInstance | null>(null)
  const [showPoster, setShowPoster] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getCurrentVideoSrc = (quality?: string) => {
    const targetQuality = quality || currentQuality
    if (currentEpisode) {
      return currentEpisode[`video_${targetQuality}` as keyof Episode] as string
    } else if (movie) {
      return movie.video_links[`video_${targetQuality}` as keyof typeof movie.video_links] || ""
    }
    return ""
  }

  // ✅ Metadata for UI and poster
  let mediaTitle = ""
  let mediaYear = ""
  let mediaLanguage = ""
  let mediaThumbnail = ""
  let backLink = ""

  if (currentEpisode && tvSeries) {
    mediaTitle = `${tvSeries.title} - S${season}E${episode}: ${currentEpisode.episode_name}`
    mediaYear = new Date(tvSeries.release_date).getFullYear().toString()
    mediaLanguage = tvSeries.language
    mediaThumbnail = tvSeries.thumbnail
    backLink = `/tv-series/${movieId}`
  } else if (movie) {
    mediaTitle = movie.title
    mediaYear = new Date(movie.release_date).getFullYear().toString()
    mediaLanguage = movie.language
    mediaThumbnail = movie.thumbnail
    backLink = `/movie/${movieId}`
  }

  // ✅ Fetch media info
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()

        if (data.type === "tv" && episode && season) {
          setTvSeries(data)
          const seasonKey = `season_${season}`
          const seasonData = data.seasons?.[seasonKey]
          const episodeData = seasonData?.episodes?.find(
            (ep: Episode) => ep.episode_number === Number.parseInt(episode),
          )
          if (episodeData) {
            setCurrentEpisode(episodeData)
            const qualities: string[] = []
            if (episodeData.video_720p) qualities.push("720p")
            if (episodeData.video_1080p) qualities.push("1080p")
            setAvailableQualities(qualities)
            setCurrentQuality(preferredQuality && qualities.includes(preferredQuality) ? preferredQuality : qualities[0])
          }
        } else {
          setMovie(data)
          const qualities: string[] = []
          if (data.video_links?.video_720p) qualities.push("720p")
          if (data.video_links?.video_1080p) qualities.push("1080p")
          if (data.video_links?.video_2160p) qualities.push("2160p")
          setAvailableQualities(qualities)
          setCurrentQuality(
            preferredQuality && qualities.includes(preferredQuality)
              ? preferredQuality
              : qualities.includes("2160p")
              ? "2160p"
              : qualities.includes("1080p")
              ? "1080p"
              : "720p",
          )
        }
      } catch (error) {
        console.error("[v0] Error fetching media:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [movieId, preferredQuality, episode, season])

  // ✅ Plyr initialization
  useEffect(() => {
    const loadPlyr = () => {
      if (typeof window === "undefined" || !currentQuality || availableQualities.length === 0) return

      if (!document.querySelector('link[href*="plyr.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://cdn.plyr.io/3.7.8/plyr.css"
        document.head.appendChild(link)
      }

      if (!window.Plyr) {
        const script = document.createElement("script")
        script.src = "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"
        script.async = true
        script.onload = () => initializePlyr()
        document.head.appendChild(script)
      } else {
        initializePlyr()
      }
    }

    const initializePlyr = () => {
      if (!videoRef.current || !window.Plyr || !currentQuality) return
      if (plyrInstance) plyrInstance.destroy()

      const player = new window.Plyr(videoRef.current, {
        controls: ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"],
        settings: ["quality", "speed"],
        quality: {
          default: Number.parseInt(currentQuality.replace("p", "")),
          options: availableQualities.map((q) => Number.parseInt(q.replace("p", ""))),
          forced: true,
          onChange: (newQuality: number) => {
            const newQualityStr = newQuality + "p"
            if (newQualityStr !== currentQuality) {
              setCurrentQuality(newQualityStr)
              const newSrc = getCurrentVideoSrc(newQualityStr)
              if (newSrc) {
                const currentTime = player.currentTime
                player.source = {
                  type: "video",
                  sources: [{ src: newSrc, type: getMimeType(newSrc), size: newQuality }],
                }
                player.once("canplay", () => {
                  player.currentTime = currentTime
                })
              }
            }
          },
        },
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        preload: "auto",
      })

      const initialSrc = getCurrentVideoSrc()
      if (initialSrc) {
        player.source = {
          type: "video",
          sources: [{ src: initialSrc, type: getMimeType(initialSrc), size: Number.parseInt(currentQuality.replace("p", "")) }],
          poster: mediaThumbnail || undefined,
        }
      }

      player.on("play", () => setShowPoster(false))
      setPlyrInstance(player)
    }

    if (availableQualities.length > 0 && currentQuality) loadPlyr()

    return () => {
      if (plyrInstance) plyrInstance.destroy()
    }
  }, [availableQualities, currentQuality])

  const currentVideoSrc = getCurrentVideoSrc()

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Loading Filmzi Player...</div>
  }

  if (!currentVideoSrc) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Video source not available</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-full aspect-video max-w-5xl mx-auto">
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg shadow-2xl"
            poster={mediaThumbnail}
            crossOrigin="anonymous"
            playsInline
            preload="auto"
            controls
          >
            <source src={currentVideoSrc} type={getMimeType(currentVideoSrc)} />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}
