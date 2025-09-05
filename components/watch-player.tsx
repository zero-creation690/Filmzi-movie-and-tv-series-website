"use client"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlyrInstance {
  source: any
  destroy: () => void
  play: () => Promise<void>
  pause: () => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback: (...args: any[]) => void) => void
  currentTime: number
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
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const plyrInitialized = useRef(false)

  const getCurrentVideoSrc = (quality?: string) => {
    const targetQuality = quality || currentQuality
    if (currentEpisode) {
      return currentEpisode[`video_${targetQuality}` as keyof Episode] as string
    } else if (movie) {
      return movie.video_links[`video_${targetQuality}` as keyof typeof movie.video_links] || ""
    }
    return ""
  }

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        console.log("[v0] Fetching media data for ID:", movieId)
        const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`, {
          priority: "high",
          cache: "force-cache",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

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

            console.log("[v0] Available episode qualities:", qualities)
            setAvailableQualities(qualities)

            let selectedQuality = preferredQuality
            if (!selectedQuality || !qualities.includes(selectedQuality)) {
              selectedQuality = qualities.includes("1080p") ? "1080p" : "720p"
            }
            console.log("[v0] Selected episode quality:", selectedQuality)
            setCurrentQuality(selectedQuality)
          } else {
            setError("Episode not found")
          }
        } else {
          setMovie(data)

          const qualities = []
          if (data.video_links?.video_720p) qualities.push("720p")
          if (data.video_links?.video_1080p) qualities.push("1080p")
          if (data.video_links?.video_2160p) qualities.push("2160p")

          console.log("[v0] Available qualities:", qualities)
          setAvailableQualities(qualities)

          let selectedQuality = preferredQuality
          if (!selectedQuality || !qualities.includes(selectedQuality)) {
            selectedQuality = qualities.includes("2160p") ? "2160p" : qualities.includes("1080p") ? "1080p" : "720p"
          }
          console.log("[v0] Selected quality:", selectedQuality)
          setCurrentQuality(selectedQuality)
        }
      } catch (error) {
        console.error("[v0] Error fetching media:", error)
        setError("Failed to load media")
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [movieId, preferredQuality, episode, season])

  useEffect(() => {
    // Load Plyr CSS
    if (!document.querySelector('link[href*="plyr"]')) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://cdn.plyr.io/3.7.8/plyr.css"
      document.head.appendChild(link)
    }

    // Load Plyr JS
    if (!window.Plyr && !plyrInitialized.current) {
      const script = document.createElement("script")
      script.src = "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"
      script.async = true
      script.onload = () => {
        console.log("Plyr script loaded")
        initializePlyr()
      }
      document.head.appendChild(script)
    } else if (window.Plyr && !plyrInitialized.current) {
      initializePlyr()
    }

    return () => {
      if (plyrInstance) {
        plyrInstance.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (plyrInstance && currentQuality && availableQualities.length > 0) {
      updatePlayerSource()
    }
  }, [currentQuality, availableQualities, plyrInstance])

  const initializePlyr = () => {
    if (!videoRef.current || !window.Plyr || plyrInitialized.current) {
      console.error("Video ref or Plyr not available")
      return
    }

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
          console.log("[v0] Quality changed to:", newQuality + "p")
          const newQualityStr = newQuality + "p"
          if (newQualityStr !== currentQuality) {
            setCurrentQuality(newQualityStr)
          }
        },
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
      autoplay: false,
      autopause: true,
      hideControls: false,
      resetOnEnd: false,
      clickToPlay: true,
      keyboard: { focused: true, global: false },
    })

    player.on("play", () => {
      console.log("Player playing")
      setShowPoster(false)
      setIsPlaying(true)
    })

    player.on("pause", () => {
      console.log("Player paused")
      setIsPlaying(false)
    })

    player.on("ready", () => {
      console.log("[v0] Plyr player ready")
      setPlyrInstance(player)
      plyrInitialized.current = true
      updatePlayerSource()
    })

    player.on("error", (event: any) => {
      console.error("[v0] Plyr error:", event)
      console.error("[v0] Current video source:", getCurrentVideoSrc())
      setError("Failed to play video. Please try a different quality.")
    })

    player.on("qualitychange", (event: any) => {
      console.log("[v0] Quality change event:", event)
    })
  }

  const updatePlayerSource = () => {
    if (!plyrInstance || !videoRef.current) return

    const currentVideoSrc = getCurrentVideoSrc()
    console.log("[v0] Updating player source to:", currentVideoSrc)

    if (!currentVideoSrc) {
      setError("Video source not available")
      return
    }

    // Update the video element source directly
    const sourceElement = videoRef.current.querySelector('source')
    if (sourceElement) {
      sourceElement.src = currentVideoSrc
      videoRef.current.load()
    }

    // Also update Plyr source
    plyrInstance.source = {
      type: "video",
      sources: [
        {
          src: currentVideoSrc,
          type: "video/mp4",
          size: Number.parseInt(currentQuality.replace("p", "")),
        },
      ],
      poster: mediaThumbnail,
    }
  }

  const handlePlayClick = () => {
    if (plyrInstance) {
      plyrInstance.play().catch((e: any) => {
        console.error("Play error:", e)
        // Fallback to direct video play
        if (videoRef.current) {
          videoRef.current.play().catch((e: any) => {
            console.error("Direct play error:", e)
            setError("Failed to play video. Please try a different quality.")
          })
        }
      })
      setShowPoster(false)
    } else if (videoRef.current) {
      videoRef.current.play().catch((e: any) => {
        console.error("Direct play error:", e)
        setError("Failed to play video. Please try a different quality.")
      })
      setShowPoster(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl animate-pulse">Loading Filmzi Player...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link href={backLink}>
            <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!movie && !tvSeries) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Content not found</div>
      </div>
    )
  }

  if (tvSeries && !currentEpisode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Episode not found</div>
      </div>
    )
  }

  const currentVideoSrc = getCurrentVideoSrc()
  console.log("[v0] Current video source:", currentVideoSrc)

  if (!currentVideoSrc || currentVideoSrc.trim() === "") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Video source not available</div>
          <div className="text-white/70 text-sm mb-6">
            The {currentQuality} quality video is not available for this content.
          </div>
          <Link href={backLink}>
            <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/20 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
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
                <span className="text-white/60">•</span>
                <span className="text-red-400 text-xs sm:text-sm font-medium">{currentQuality}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPoster && mediaThumbnail && (
        <div
          className="absolute inset-0 z-40 bg-black flex items-center justify-center cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="relative">
            <img
              src={mediaThumbnail || "/placeholder.svg"}
              alt={mediaTitle}
              className="w-full h-auto max-w-md rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={playerContainerRef} className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-full aspect-video max-w-5xl mx-auto">
          <video
            ref={videoRef}
            className="plyr__video w-full h-full rounded-lg shadow-2xl"
            poster={mediaThumbnail}
            crossOrigin="anonymous"
            playsInline
            preload="auto"
            controls={false}
          >
            <source src={currentVideoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <style jsx global>{`
        .plyr {
          --plyr-color-main: #dc2626;
          --plyr-video-background: #000000;
        }
        
        .plyr--video {
          background: #000000;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .plyr__controls {
          background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8));
          color: white;
        }
        
        .plyr__control--overlaid {
          background: rgba(220, 38, 38, 0.8);
          border: 2px solid rgba(220, 38, 38, 0.5);
          width: 80px;
          height: 80px;
        }
        
        .plyr__control--overlaid:hover {
          background: rgba(220, 38, 38, 1);
        }
        
        .plyr__control--overlaid svg {
          width: 32px;
          height: 32px;
        }
        
        .plyr__menu__container {
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 8px;
        }
        
        .plyr__menu__container .plyr__control {
          color: white;
        }
        
        .plyr__menu__container .plyr__control:hover {
          background: rgba(220, 38, 38, 0.2);
        }
        
        .plyr__menu__container .plyr__control[aria-checked="true"] {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
        }
        
        .plyr__control[aria-expanded="true"] {
          background: rgba(220, 38, 38, 0.2);
        }
        
        .plyr__progress__buffer {
          color: rgba(255, 255, 255, 0.2);
        }
        
        .plyr__volume__display {
          color: white;
        }
        
        .plyr__tooltip {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border: 1px solid rgba(220, 38, 38, 0.3);
        }
      `}</style>
    </div>
  )
}
