"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const playerRef = useRef<Plyr>()

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        console.log("[v0] Fetching media data for ID:", movieId)
        const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`)
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
        } finally {
          setLoading(false)
        }
      }

      fetchMedia()
    }, [movieId, preferredQuality, episode, season])

    useEffect(() => {
      if (!videoRef.current) return

      // Initialize Plyr player
      playerRef.current = new Plyr(videoRef.current, {
        controls: [],
        autoplay: false,
        mute: false,
        volume: 1,
        hideControls: true,
      })

      const player = playerRef.current

      const handleLoadedMetadata = () => {
        setDuration(player.duration)
        console.log("[v0] Video loaded, duration:", player.duration)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(player.currentTime)
      }

      const handlePlay = () => {
        setIsPlaying(true)
        console.log("[v0] Video started playing")
      }

      const handlePause = () => {
        setIsPlaying(false)
        console.log("[v0] Video paused")
      }

      const handleVolumeChange = () => {
        setVolume(player.volume)
        setIsMuted(player.muted)
      }

      player.on("loadedmetadata", handleLoadedMetadata)
      player.on("timeupdate", handleTimeUpdate)
      player.on("play", handlePlay)
      player.on("pause", handlePause)
      player.on("volumechange", handleVolumeChange)

      return () => {
        player.off("loadedmetadata", handleLoadedMetadata)
        player.off("timeupdate", handleTimeUpdate)
        player.off("play", handlePlay)
        player.off("pause", handlePause)
        player.off("volumechange", handleVolumeChange)
        player.destroy()
      }
    }, [movie, currentEpisode, currentQuality])

    useEffect(() => {
      const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
        setShowControls(true)
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) {
            setShowControls(false)
          }
        }, 3000)
      }

      const handleMouseMove = () => {
        resetControlsTimeout()
      }

      const container = containerRef.current
      if (container) {
        container.addEventListener("mousemove", handleMouseMove)
        resetControlsTimeout()
      }

      return () => {
        if (container) {
          container.removeEventListener("mousemove", handleMouseMove)
        }
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      }
    }, [isPlaying])

    const togglePlay = () => {
      if (!playerRef.current) return

      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }

    const toggleMute = () => {
      if (!playerRef.current) return
      playerRef.current.muted = !playerRef.current.muted
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!playerRef.current) return

      const newVolume = Number.parseFloat(e.target.value)
      playerRef.current.volume = newVolume
      setVolume(newVolume)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!playerRef.current) return

      const newTime = (Number.parseFloat(e.target.value) / 100) * duration
      playerRef.current.currentTime = newTime
    }

    const changeQuality = (quality: string) => {
      if (!playerRef.current || currentQuality === quality) return

      const currentTimeBackup = playerRef.current.currentTime
      const wasPlaying = !playerRef.current.paused

      console.log("[v0] Changing quality to:", quality)
      setCurrentQuality(quality)

      let newSrc = ""
      if (currentEpisode) {
        newSrc = currentEpisode[`video_${quality}` as keyof Episode] as string
      } else if (movie) {
        newSrc = movie.video_links[`video_${quality}` as keyof typeof movie.video_links] || ""
      }

      if (newSrc && videoRef.current) {
        // Update the video source
        videoRef.current.src = newSrc
        
        // Reload the player with the new source
        playerRef.current.source = {
          type: 'video',
          sources: [{
            src: newSrc,
            type: 'video/mp4'
          }]
        }

        // Restore playback state
        playerRef.current.once('loadedmetadata', () => {
          playerRef.current!.currentTime = currentTimeBackup
          if (wasPlaying) {
            playerRef.current!.play()
          }
        })
      }
    }

    const toggleFullscreen = () => {
      if (!playerRef.current) return
      playerRef.current.fullscreen.toggle()
    }

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-red-500 text-xl animate-pulse">Loading Filmzi Player...</div>
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

    let currentVideoSrc = ""
    let mediaTitle = ""
    let mediaYear = ""
    let mediaLanguage = ""
    let mediaThumbnail = ""
    let backLink = ""

    if (currentEpisode && tvSeries) {
      currentVideoSrc = currentEpisode[`video_${currentQuality}` as keyof Episode] as string
      mediaTitle = `${tvSeries.title} - S${season}E${episode}: ${currentEpisode.episode_name}`
      mediaYear = new Date(tvSeries.release_date).getFullYear().toString()
      mediaLanguage = tvSeries.language
      mediaThumbnail = tvSeries.thumbnail
      backLink = `/tv-series/${movieId}`
    } else if (movie) {
      currentVideoSrc = movie.video_links[`video_${currentQuality}` as keyof typeof movie.video_links] || ""
      mediaTitle = movie.title
      mediaYear = new Date(movie.release_date).getFullYear().toString()
      mediaLanguage = movie.language
      mediaThumbnail = movie.thumbnail
      backLink = `/movie/${movieId}`
    }

    return (
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-black overflow-hidden cursor-none"
        style={{ cursor: showControls ? "default" : "none" }}
      >
        <video
          ref={videoRef}
          className="plyr__video w-full h-full object-contain"
          poster={mediaThumbnail}
          crossOrigin="anonymous"
          playsInline
          onClick={togglePlay}
          src={currentVideoSrc}
        >
          Your browser does not support the video tag.
        </video>

        <div
          className={`absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 sm:p-6 transition-all duration-300 ${
            showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
          }`}
        >
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

            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-white/70 text-xs sm:text-sm mr-2 hidden sm:inline">Quality:</span>
              {availableQualities.map((quality) => (
                <Button
                  key={quality}
                  variant={currentQuality === quality ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeQuality(quality)}
                  className={
                    currentQuality === quality
                      ? "bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-lg shadow-red-600/25 text-xs sm:text-sm px-2 sm:px-3"
                      : "text-white hover:bg-red-600/20 border border-red-600/30 hover:border-red-500 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-3"
                  }
                >
                  {quality}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 transition-all duration-300 ${
            showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          }`}
        >
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-red-600/20 p-2">
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-red-600/20 p-2">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider hidden sm:block"
                />
              </div>

              <div className="text-white text-xs sm:text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-red-600/20 p-2">
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-6 backdrop-blur-sm border-2 border-red-500/50 transition-all duration-200 hover:scale-110"
            >
              <Play className="w-8 h-8 sm:w-12 sm:h-12" />
            </Button>
          </div>
        )}

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #dc2626;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }

          .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #dc2626;
            cursor: pointer;
            border: 2px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }

          .slider::-webkit-slider-track {
            background: rgba(255, 255, 255, 0.2);
            height: 4px;
            border-radius: 2px;
          }

          .slider::-moz-range-track {
            background: rgba(255, 255, 255, 0.2);
            height: 4px;
            border-radius: 2px;
          }
        `}</style>
      </div>
    )
  }
