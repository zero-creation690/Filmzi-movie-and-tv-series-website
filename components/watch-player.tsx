// src/components/PlyrVideoPlayer.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

interface VideoSource {
  src: string
  type: string
  size?: number
}

interface PlyrPlayerProps {
  sources?: VideoSource[]
  poster?: string | null
}

const PlyrVideoPlayer = ({ sources = [], poster = null }: PlyrPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerInstance = useRef<Plyr | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const videoSources = sources.length > 0 ? sources : []

  useEffect(() => {
    if (!videoRef.current || playerInstance.current) return

    setIsLoading(true)

    try {
      playerInstance.current = new Plyr(videoRef.current, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        settings: ["quality", "speed"],
        quality: {
          default: videoSources.find(s => s.size)?.size || undefined,
          options: videoSources.map(s => s.size).filter(Boolean) as number[],
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
        poster: poster || undefined,
      })

      playerInstance.current.on("ready", () => {
        setIsLoading(false)
        console.log("Plyr player ready.")
      })
      playerInstance.current.on("waiting", () => setIsLoading(true))
      playerInstance.current.on("playing", () => setIsLoading(false))
      playerInstance.current.on("error", () => {
        console.error("Player playback error")
        setIsLoading(false)
      })

    } catch (error) {
      console.error("Player initialization error:", error)
      setIsLoading(false)
    }

    return () => {
      playerInstance.current?.destroy()
      playerInstance.current = null
    }
  }, [videoSources, poster])

  return (
    <div
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      <video
        ref={videoRef}
        poster={poster || undefined}
        playsInline
        controls={true}
        className="w-full h-full"
      >
        {videoSources.map((source, index) => (
          <source
            key={`source-${index}`}
            src={source.src}
            type={source.type}
            size={source.size}
          />
        ))}
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-red-400 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlyrVideoPlayer
