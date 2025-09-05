"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

// ... (your existing interfaces remain unchanged)

export function WatchPlayer({ movieId, preferredQuality, episode, season }: WatchPlayerProps) {
  // ... (your existing state variables remain unchanged)
  
  const playerRef = useRef<Plyr>() // Add Plyr reference

  useEffect(() => {
    const fetchMedia = async () => {
      // ... (your existing fetchMedia implementation)
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

    // Update event listeners to use Plyr instance
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

  // ... (rest of your useEffect hooks remain unchanged)

  // Update control functions to use Plyr instance
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
      videoRef.current.src = newSrc
      
      // Update Plyr source
      playerRef.current.source = {
        type: 'video',
        sources: [{
          src: newSrc,
          type: 'video/mp4'
        }]
      }

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

  // ... (rest of your component remains unchanged)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-none"
      style={{ cursor: showControls ? "default" : "none" }}
    >
      {/* Add plyr__video class for Plyr styling */}
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

      {/* ... (rest of your JSX remains unchanged) */}
    </div>
  )
}
