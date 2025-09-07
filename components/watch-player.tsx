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

  // ✅ Move metadata ABOVE Plyr usage
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

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        console.log("[v0] Fetching media data for ID:", movieId)
        const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`, {
          priority: "high",
          cache: "force-cache",
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        console.log("[v0] Media data received:", data)

        if (data.type === "tv" && episode && season) {
          setTvSeries(data)
          const seasonKey = `season_${season}`
          const seasonData = data.seasons?.[seasonKey]
          const episodeData = seasonData?.episodes?.find(
            (ep: Episode) => ep.episode_number === Number.parseInt(episode),
          )

          if (episodeData) {
            setCurrentEpisode(episodeData)
            console.log("[v0] Episode data:", episodeData)

            const qualities = []
            if (episodeData.video_720p) qualities.push("720p")
            if (episodeData.video_1080p) qualities.push("1080p")
            setAvailableQualities(qualities)

            let selectedQuality = preferredQuality
            if (!selectedQuality || !qualities.includes(selectedQuality)) {
              selectedQuality = qualities.includes("1080p") ? "1080p" : "720p"
            }
            setCurrentQuality(selectedQuality)
          }
        } else {
          setMovie(data)

          const qualities = []
          if (data.video_links?.video_720p) qualities.push("720p")
          if (data.video_links?.video_1080p) qualities.push("1080p")
          if (data.video_links?.video_2160p) qualities.push("2160p")
          setAvailableQualities(qualities)

          let selectedQuality = preferredQuality
          if (!selectedQuality || !qualities.includes(selectedQuality)) {
            selectedQuality = qualities.includes("2160p") ? "2160p" : qualities.includes("1080p") ? "1080p" : "720p"
          }
          setCurrentQuality(selectedQuality)
        }
      } catch (error) {
        console.error("[v0] Error fetching media:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [movieId, preferredQuality, episode, season])

  useEffect(() => {
    const loadPlyr = async () => {
      if (typeof window === "undefined" || !currentQuality || availableQualities.length === 0) return

      if (!document.querySelector('link[href*="plyr"]')) {
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "style"
        link.href = "https://cdn.plyr.io/3.7.8/plyr.css"
        link.onload = () => {
          link.rel = "stylesheet"
        }
        document.head.appendChild(link)
      }

      if (!window.Plyr) {
        const script = document.createElement("script")
        script.src = "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"
        script.async = true
        script.onload = () => {
          initializePlyr()
        }
        document.head.appendChild(script)
      } else {
        initializePlyr()
      }
    }

    const initializePlyr = () => {
      if (!videoRef.current || !window.Plyr || !currentQuality) return
      if (plyrInstance) plyrInstance.destroy()

      console.log("[v0] Initializing Plyr with quality:", currentQuality)

      const player = new window.Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
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
                  sources: [{ src: newSrc, type: "video/mp4", size: newQuality }],
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
        autopause: false,
        hideControls: true,
        resetOnEnd: false,
        clickToPlay: true,
        keyboard: { focused: true, global: false },
      })

      const initialSrc = getCurrentVideoSrc()
      if (initialSrc) {
        player.source = {
          type: "video",
          sources: [{ src: initialSrc, type: "video/mp4", size: Number.parseInt(currentQuality.replace("p", "")) }],
          poster: mediaThumbnail || undefined, // ✅ Safe poster
        }
      }

      player.on("play", () => setShowPoster(false))
      player.on("ready", () => console.log("[v0] Plyr ready with source:", getCurrentVideoSrc()))
      player.on("error", (e: any) => console.error("[v0] Plyr error:", e))

      setPlyrInstance(player)
    }

    if (availableQualities.length > 0 && currentQuality) loadPlyr()

    return () => {
      if (plyrInstance) plyrInstance.destroy()
    }
  }, [availableQualities, currentQuality])

  // ... rest of your component unchanged
}
