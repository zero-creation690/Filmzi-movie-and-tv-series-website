"use client"
import { useEffect, useRef, useState } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"
import Image from "next/image"

interface VideoSource {
  src: string
  type: string
  size?: number
}

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
  total_episodes: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  title: string
  thumbnail: string
  release_date: string
  language: string
  total_seasons: number
  seasons: { [key: string]: Season }
}

interface WatchPlayerProps {
  movieId: string
  preferredQuality?: string
  episode?: string
  season?: string
}

// ✅ Detect MIME type
const getMimeType = (url: string): string => {
  const ext = url.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "mp4": return "video/mp4"
    case "webm": return "video/webm"
    case "ogg":
    case "ogv": return "video/ogg"
    case "mkv": return "video/x-matroska"
    default: return "video/mp4"
  }
}

export default function WatchPlayer({ movieId, preferredQuality, episode, season }: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Plyr | null>(null)
  const [sources, setSources] = useState<VideoSource[]>([])
  const [poster, setPoster] = useState<string>("")
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`https://databaseuisk-three.vercel.app/api/media/${movieId}`)
        const data = await res.json()

        const videoSources: VideoSource[] = []

        if (data.type === "tv" && episode && season) {
          const seasonKey = `season_${season}`
          const ep = data.seasons?.[seasonKey]?.episodes?.find(
            (e: Episode) => e.episode_number === Number(episode)
          )
          if (ep) {
            if (ep.video_720p) videoSources.push({ src: ep.video_720p, type: getMimeType(ep.video_720p), size: 720 })
            if (ep.video_1080p) videoSources.push({ src: ep.video_1080p, type: getMimeType(ep.video_1080p), size: 1080 })
            setPoster(data.thumbnail)
          }
        } else {
          if (data.video_links?.video_720p) videoSources.push({ src: data.video_links.video_720p, type: getMimeType(data.video_links.video_720p), size: 720 })
          if (data.video_links?.video_1080p) videoSources.push({ src: data.video_links.video_1080p, type: getMimeType(data.video_links.video_1080p), size: 1080 })
          if (data.video_links?.video_2160p) videoSources.push({ src: data.video_links.video_2160p, type: getMimeType(data.video_links.video_2160p), size: 2160 })
          setPoster(data.thumbnail)
        }

        setSources(videoSources)
      } catch (err) {
        console.error("Error fetching media:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [movieId, episode, season])

  useEffect(() => {
    if (!videoRef.current || sources.length === 0) return

    playerRef.current = new Plyr(videoRef.current, {
      controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "settings", "fullscreen"],
      settings: ["quality", "speed"],
      quality: {
        default: sources[0].size || 720,
        options: sources.map((s) => s.size).filter(Boolean) as number[],
      },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    })

    playerRef.current.on("ready", () => {
      setIsReady(true)
      setIsLoading(false)
    })
    playerRef.current.on("play", () => setIsPlaying(true))
    playerRef.current.on("pause", () => setIsPlaying(false))
    playerRef.current.on("waiting", () => setIsLoading(true))
    playerRef.current.on("playing", () => setIsLoading(false))

    return () => {
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [sources])

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-green-400">Loading player...</div>
  }

  if (sources.length === 0) {
    return <div className="min-h-[60vh] flex items-center justify-center text-red-400">No video available</div>
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <video ref={videoRef} poster={poster} playsInline controls={false} className="w-full h-full">
        {sources.map((s, i) => (
          <source key={i} src={s.src} type={s.type} size={s.size} />
        ))}
      </video>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
